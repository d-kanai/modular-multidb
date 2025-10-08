import { UserRepository } from '../repositories/user.repository.impl.js';
import { SignupUserUseCase } from '../../application/commands/signup-user.command.js';
import { GetUserUseCase } from '../../application/queries/get-user.query.js';
import { ActivateUserUseCase } from '../../application/commands/activate-user.command.js';
import { UserController } from '../../presentation/controllers/user.controller.js';
import { EventController } from '../../presentation/controllers/event.controller.js';
import { ScreeningPassedHandler } from '../../application/event-handlers/screening-passed.handler.js';
import { eventBus } from '../events/event-bus.js';

// Repositories
const userRepository = new UserRepository();

// Use Cases
const signupUserUseCase = new SignupUserUseCase(userRepository);
const getUserUseCase = new GetUserUseCase(userRepository);
const activateUserUseCase = new ActivateUserUseCase(userRepository);

// Controllers
export const userController = new UserController(signupUserUseCase, getUserUseCase);
export const eventController = new EventController();

// Event Handlers
const screeningPassedHandler = new ScreeningPassedHandler(activateUserUseCase);

// Setup Event Subscribers
export function setupEventSubscribers() {
  eventBus.subscribe('screening.passed', (data) => screeningPassedHandler.handle(data));
}
