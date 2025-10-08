import { ScreeningRepository } from '../repositories/screening.repository.impl.js';
import { UserApiClient } from '../external/user-api.client.js';
import { HttpEventPublisher } from '../events/event-publisher.js';
import { ApplyScreeningUseCase } from '../../application/use-cases/apply-screening.use-case.js';
import { ListScreeningsUseCase } from '../../application/use-cases/list-screenings.use-case.js';
import { PassScreeningUseCase } from '../../application/use-cases/pass-screening.use-case.js';
import { ScreeningController } from '../../presentation/controllers/screening.controller.js';

// Infrastructure
const screeningRepository = new ScreeningRepository();
const eventPublisher = new HttpEventPublisher();

// Use Cases
const applyScreeningUseCase = new ApplyScreeningUseCase(screeningRepository);
const listScreeningsUseCase = new ListScreeningsUseCase(screeningRepository);
const passScreeningUseCase = new PassScreeningUseCase(screeningRepository, eventPublisher);

// Controllers
export const screeningController = new ScreeningController(
  applyScreeningUseCase,
  listScreeningsUseCase,
  passScreeningUseCase
);
