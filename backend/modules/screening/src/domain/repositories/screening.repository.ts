import { Screening } from '../entities/screening.entity.js';

export interface IScreeningRepository {
  create(userId: string): Promise<Screening>;
  findById(id: string): Promise<Screening | null>;
  findAll(): Promise<Screening[]>;
  update(screening: Screening): Promise<Screening>;
}
