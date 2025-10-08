import { ActivateUserUseCase } from '../use-cases/activate-user.use-case.js';

export class ScreeningPassedHandler {
  constructor(private readonly activateUserUseCase: ActivateUserUseCase) {}

  async handle(data: { userId: string }): Promise<void> {
    await this.activateUserUseCase.execute(data.userId);
  }
}
