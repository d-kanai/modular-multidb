import { DomainEvent, DomainEventName } from '../events/domain-event.js';
import { DomainModel } from './domain-model.base.js';

export enum ScreeningStatus {
  PENDING = 'PENDING',
  PASSED = 'PASSED',
  REJECTED = 'REJECTED'
}

export class Screening extends DomainModel {

  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly userName: string,
    private _status: ScreeningStatus,
    public readonly createdAt: Date,
    private _updatedAt: Date
  ) {
    super();
    this.validate();
  }

  // Getters
  get status(): ScreeningStatus {
    return this._status;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // 不変条件 (Invariants)
  private validate(): void {
    if (!this.userId || this.userId.trim().length === 0) {
      throw new Error('Screening must have a userId');
    }
    if (!this.userName || this.userName.trim().length === 0) {
      throw new Error('Screening must have a userName');
    }
  }

  // ファクトリーメソッド: スクリーニング申請
  static apply(userId: string, userName: string): Screening {
    if (!userId || userId.trim().length === 0) {
      throw new Error('UserId is required for screening application');
    }
    if (!userName || userName.trim().length === 0) {
      throw new Error('UserName is required for screening application');
    }

    const id = this.generateId();
    const now = new Date();

    // 生成ルール: 新規スクリーニングは必ずPENDINGステータス
    const screening = new Screening(id, userId, userName, ScreeningStatus.PENDING, now, now);

    // Domain Event発行
    screening.addDomainEvent({
      eventName: DomainEventName.SCREENING_APPLIED,
      occurredOn: now,
      data: { screeningId: id, userId, userName }
    });

    return screening;
  }

  // ファクトリーメソッド: 既存データから再構築
  static reconstruct(
    id: string,
    userId: string,
    userName: string,
    status: ScreeningStatus,
    createdAt: Date,
    updatedAt: Date
  ): Screening {
    return new Screening(id, userId, userName, status, createdAt, updatedAt);
  }

  // 状態遷移: 合格
  pass(): void {
    // ガード条件: すでにPASSEDの場合は何もしない
    if (this._status === ScreeningStatus.PASSED) {
      return;
    }

    // ガード条件: PENDINGからのみPASSEDに遷移可能
    if (this._status !== ScreeningStatus.PENDING) {
      throw new Error(`Cannot pass screening with status: ${this._status}`);
    }

    this._status = ScreeningStatus.PASSED;
    this._updatedAt = new Date();

    // Domain Event発行 (重要: 他のモジュールに通知)
    this.addDomainEvent({
      eventName: DomainEventName.SCREENING_PASSED,
      occurredOn: this._updatedAt,
      data: {
        screeningId: this.id,
        userId: this.userId
      }
    });
  }

  // 状態遷移: 不合格
  reject(): void {
    // ガード条件: すでにREJECTEDの場合は何もしない
    if (this._status === ScreeningStatus.REJECTED) {
      return;
    }

    // ガード条件: PENDINGからのみREJECTEDに遷移可能
    if (this._status !== ScreeningStatus.PENDING) {
      throw new Error(`Cannot reject screening with status: ${this._status}`);
    }

    this._status = ScreeningStatus.REJECTED;
    this._updatedAt = new Date();

    // Domain Event発行
    this.addDomainEvent({
      eventName: DomainEventName.SCREENING_REJECTED,
      occurredOn: this._updatedAt,
      data: {
        screeningId: this.id,
        userId: this.userId
      }
    });
  }

  // 状態確認メソッド
  isPending(): boolean {
    return this._status === ScreeningStatus.PENDING;
  }

  isPassed(): boolean {
    return this._status === ScreeningStatus.PASSED;
  }

  isRejected(): boolean {
    return this._status === ScreeningStatus.REJECTED;
  }

  // ビジネスルール: 再申請可能か
  canReapply(): boolean {
    return this._status === ScreeningStatus.REJECTED;
  }
}
