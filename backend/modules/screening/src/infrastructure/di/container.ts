import { ScreeningRepository } from '../repositories/screening.repository.impl.js';
import { UserApiClient } from '../external/user-api.client.js';
import { HttpEventPublisher } from '../events/event-publisher.js';
import { ApplyScreeningUseCase } from '../../application/commands/apply-screening.command.js';
import { ListScreeningsUseCase } from '../../application/queries/list-screenings.query.js';
import { PassScreeningUseCase } from '../../application/commands/pass-screening.command.js';
import { ScreeningController } from '../../presentation/controllers/screening.controller.js';

// Infrastructure
const screeningRepository = new ScreeningRepository();
const eventPublisher = new HttpEventPublisher();
const userApiClient = new UserApiClient();

// Use Cases
const applyScreeningUseCase = new ApplyScreeningUseCase(screeningRepository, userApiClient);
const listScreeningsUseCase = new ListScreeningsUseCase(screeningRepository);
const passScreeningUseCase = new PassScreeningUseCase(screeningRepository, eventPublisher);

// Controllers
export const screeningController = new ScreeningController(
  applyScreeningUseCase,
  listScreeningsUseCase,
  passScreeningUseCase
);
