// External API calls to User module
const USER_API_URL = 'http://localhost:4000';

export async function getUserById(userId: string) {
  try {
    const response = await fetch(`${USER_API_URL}/api/users/${userId}`);
    if (!response.ok) {
      throw new Error(`User not found: ${userId}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}
