import { Screening } from '../entities/screening.entity.js';

export interface IScreeningRepository {
  save(screening: Screening): Promise<Screening>;
  findById(id: string): Promise<Screening | null>;
  findAll(): Promise<Screening[]>;
  update(screening: Screening): Promise<Screening>;
}
