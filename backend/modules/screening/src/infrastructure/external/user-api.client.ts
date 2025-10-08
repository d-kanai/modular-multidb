import { getUser } from './generated/user-api/sdk.gen.js';
import { client } from './generated/user-api/client.gen.js';
import type { User } from './generated/user-api/types.gen.js';

const USER_API_URL = process.env.USER_API_URL || 'http://localhost:4000';
const INTERNAL_API_TOKEN = process.env.INTERNAL_API_TOKEN;

export class UserApiClient {
  constructor() {
    // Configure the generated client with base URL
    client.setConfig({
      baseUrl: USER_API_URL
    });
  }

  async getUser(userId: string): Promise<User | null> {
    if (!INTERNAL_API_TOKEN) {
      throw new Error('INTERNAL_API_TOKEN is not configured');
    }

    try {
      const { data, error } = await getUser({
        client,
        path: { id: userId },
        headers: {
          'X-Internal-Token': INTERNAL_API_TOKEN
        }
      });

      if (error) {
        return null;
      }

      return data ?? null;
    } catch (err) {
      console.error('Error fetching user:', err);
      return null;
    }
  }
}
