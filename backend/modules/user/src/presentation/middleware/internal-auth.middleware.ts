import { Context, Next } from 'hono';

export async function internalAuthMiddleware(c: Context, next: Next) {
  const token = c.req.header('X-Internal-Token');
  const expectedToken = process.env.INTERNAL_API_TOKEN;

  if (!expectedToken) {
    console.error('INTERNAL_API_TOKEN is not configured');
    return c.json({ error: 'Internal server configuration error' }, 500);
  }

  if (!token || token !== expectedToken) {
    return c.json({ error: 'Unauthorized: Invalid internal token' }, 401);
  }

  await next();
}
