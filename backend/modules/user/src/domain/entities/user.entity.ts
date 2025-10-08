import { DomainEvent, DomainEventName } from '../events/domain-event.js';
import { DomainModel } from './domain-model.base.js';

export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export class User extends DomainModel {

  private constructor(
    public readonly id: string,
    private _name: string,
    private _status: UserStatus,
    public readonly createdAt: Date,
    private _updatedAt: Date
  ) {
    super();
    this.validate();
  }

  // Getters
  get name(): string {
    return this._name;
  }

  get status(): UserStatus {
    return this._status;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // 不変条件 (Invariants)
  private validate(): void {
    if (!this._name || this._name.trim().length === 0) {
      throw new Error('User name cannot be empty');
    }
    if (this._name.length > 100) {
      throw new Error('User name must be 100 characters or less');
    }
  }

  // ファクトリーメソッド: ユーザー登録
  static signup(name: string): User {
    const id = this.generateId();
    const now = new Date();

    // 生成ルール: 新規ユーザーは必ずPENDINGステータス
    const user = new User(id, name, UserStatus.PENDING, now, now);

    // Domain Event発行
    user.addDomainEvent({
      eventName: DomainEventName.USER_SIGNED_UP,
      occurredOn: now,
      data: { userId: id, name }
    });

    return user;
  }

  // ファクトリーメソッド: 既存データから再構築
  static reconstruct(
    id: string,
    name: string,
    status: UserStatus,
    createdAt: Date,
    updatedAt: Date
  ): User {
    return new User(id, name, status, createdAt, updatedAt);
  }

  // 状態遷移: アクティベーション
  activate(): void {
    // ガード条件: すでにACTIVEの場合は何もしない
    if (this._status === UserStatus.ACTIVE) {
      return;
    }

    // ガード条件: PENDINGからのみACTIVEに遷移可能
    if (this._status !== UserStatus.PENDING) {
      throw new Error(`Cannot activate user with status: ${this._status}`);
    }

    this._status = UserStatus.ACTIVE;
    this._updatedAt = new Date();

    // Domain Event発行
    this.addDomainEvent({
      eventName: DomainEventName.USER_ACTIVATED,
      occurredOn: this._updatedAt,
      data: { userId: this.id }
    });
  }

  // 状態遷移: 非アクティブ化
  deactivate(): void {
    // ガード条件: すでにINACTIVEの場合は何もしない
    if (this._status === UserStatus.INACTIVE) {
      return;
    }

    // ガード条件: ACTIVEからのみINACTIVEに遷移可能
    if (this._status !== UserStatus.ACTIVE) {
      throw new Error(`Cannot deactivate user with status: ${this._status}`);
    }

    this._status = UserStatus.INACTIVE;
    this._updatedAt = new Date();

    // Domain Event発行
    this.addDomainEvent({
      eventName: DomainEventName.USER_DEACTIVATED,
      occurredOn: this._updatedAt,
      data: { userId: this.id }
    });
  }

  // 状態確認メソッド
  isPending(): boolean {
    return this._status === UserStatus.PENDING;
  }

  isActive(): boolean {
    return this._status === UserStatus.ACTIVE;
  }

  isInactive(): boolean {
    return this._status === UserStatus.INACTIVE;
  }

  // ビジネスルール: ユーザーは申請可能か
  canApplyForScreening(): boolean {
    return this._status === UserStatus.PENDING;
  }
}
