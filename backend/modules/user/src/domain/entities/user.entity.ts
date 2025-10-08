export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public status: UserStatus,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  activate(): void {
    this.status = UserStatus.ACTIVE;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.status = UserStatus.INACTIVE;
    this.updatedAt = new Date();
  }

  isPending(): boolean {
    return this.status === UserStatus.PENDING;
  }

  isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }
}
