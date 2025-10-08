import { Context } from 'hono';
import { ApplyScreeningUseCase } from '../../application/use-cases/apply-screening.use-case.js';
import { ListScreeningsUseCase } from '../../application/use-cases/list-screenings.use-case.js';
import { PassScreeningUseCase } from '../../application/use-cases/pass-screening.use-case.js';

export class ScreeningController {
  constructor(
    private readonly applyScreeningUseCase: ApplyScreeningUseCase,
    private readonly listScreeningsUseCase: ListScreeningsUseCase,
    private readonly passScreeningUseCase: PassScreeningUseCase
  ) {}

  async apply(c: Context) {
    try {
      const { userId } = await c.req.json();

      const screening = await this.applyScreeningUseCase.execute(userId);

      return c.json({
        id: screening.id,
        userId: screening.userId,
        status: screening.status,
        createdAt: screening.createdAt,
        updatedAt: screening.updatedAt
      }, 201);
    } catch (error) {
      console.error('Apply screening error:', error);
      if (error instanceof Error) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  async list(c: Context) {
    try {
      const screenings = await this.listScreeningsUseCase.execute();

      return c.json(screenings.map(s => ({
        id: s.id,
        userId: s.userId,
        status: s.status,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt
      })));
    } catch (error) {
      console.error('List screenings error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  async pass(c: Context) {
    try {
      const id = c.req.param('id');

      const screening = await this.passScreeningUseCase.execute(id);

      return c.json({
        id: screening.id,
        userId: screening.userId,
        status: screening.status,
        createdAt: screening.createdAt,
        updatedAt: screening.updatedAt
      });
    } catch (error) {
      console.error('Pass screening error:', error);
      if (error instanceof Error) {
        return c.json({ error: error.message }, 404);
      }
      return c.json({ error: 'Internal server error' }, 500);
    }
  }
}
