import { ActivateUserUseCase } from '../commands/activate-user.command.js';

export class ScreeningPassedHandler {
  constructor(private readonly activateUserUseCase: ActivateUserUseCase) {}

  async handle(data: { userId: string }): Promise<void> {
    await this.activateUserUseCase.execute(data.userId);
  }
}
