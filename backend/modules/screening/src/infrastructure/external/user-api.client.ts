import { IUserValidationService } from '../../domain/services/user-validation.service.js';

const USER_API_URL = process.env.USER_API_URL || 'http://localhost:4000';
const INTERNAL_API_TOKEN = process.env.INTERNAL_API_TOKEN;

export interface UserData {
  id: string;
  name: string;
  status: string;
}

export class UserApiClient implements IUserValidationService {
  private getHeaders(): HeadersInit {
    if (!INTERNAL_API_TOKEN) {
      throw new Error('INTERNAL_API_TOKEN is not configured');
    }

    return {
      'X-Internal-Token': INTERNAL_API_TOKEN,
      'Content-Type': 'application/json'
    };
  }

  async validateUserExists(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${USER_API_URL}/api/users/${userId}`, {
        headers: this.getHeaders()
      });
      return response.ok;
    } catch (error) {
      console.error('Error validating user:', error);
      return false;
    }
  }

  async getUser(userId: string): Promise<UserData | null> {
    try {
      const response = await fetch(`${USER_API_URL}/api/users/${userId}`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data as UserData;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }
}
