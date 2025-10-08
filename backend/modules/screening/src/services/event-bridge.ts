// Bridge to connect screening events to user module
const USER_EVENT_URL = 'http://localhost:4000';

export async function publishToUserModule(eventName: string, data: any) {
  try {
    const response = await fetch(`${USER_EVENT_URL}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ eventName, data })
    });

    if (!response.ok) {
      console.error('Failed to publish event to user module');
    }
  } catch (error) {
    console.error('Error publishing event to user module:', error);
  }
}
