import { ActivateUserUseCase } from '../use-cases/activate-user.use-case.js';

export class ScreeningPassedHandler {
  constructor(private readonly activateUserUseCase: ActivateUserUseCase) {}

  async handle(data: { userId: string }): Promise<void> {
    console.log('[User Module] Received screening.passed event:', data);

    await this.activateUserUseCase.execute(data.userId);

    console.log(`[User Module] Updated user ${data.userId} status to ACTIVE`);
  }
}
