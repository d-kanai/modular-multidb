export enum ScreeningStatus {
  PENDING = 'PENDING',
  PASSED = 'PASSED',
  REJECTED = 'REJECTED'
}

export class Screening {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public status: ScreeningStatus,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  pass(): void {
    this.status = ScreeningStatus.PASSED;
    this.updatedAt = new Date();
  }

  reject(): void {
    this.status = ScreeningStatus.REJECTED;
    this.updatedAt = new Date();
  }

  isPending(): boolean {
    return this.status === ScreeningStatus.PENDING;
  }

  isPassed(): boolean {
    return this.status === ScreeningStatus.PASSED;
  }
}
