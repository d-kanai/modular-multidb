import { IUserValidationService } from '../../domain/services/user-validation.service.js';

const USER_API_URL = 'http://localhost:4000';

export class UserApiClient implements IUserValidationService {
  async validateUserExists(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${USER_API_URL}/api/users/${userId}`);
      return response.ok;
    } catch (error) {
      console.error('Error validating user:', error);
      return false;
    }
  }
}
