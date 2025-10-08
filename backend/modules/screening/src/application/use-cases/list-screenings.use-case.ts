import { IScreeningRepository } from '../../domain/repositories/screening.repository.js';
import { Screening } from '../../domain/entities/screening.entity.js';

export class ListScreeningsUseCase {
  constructor(private readonly screeningRepository: IScreeningRepository) {}

  async execute(): Promise<Screening[]> {
    return await this.screeningRepository.findAll();
  }
}
