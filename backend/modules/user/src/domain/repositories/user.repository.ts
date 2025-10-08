import { User } from '../entities/user.entity.js';

export interface IUserRepository {
  save(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  update(user: User): Promise<User>;
}
