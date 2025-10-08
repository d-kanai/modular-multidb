export interface IUserValidationService {
  validateUserExists(userId: string): Promise<boolean>;
}
