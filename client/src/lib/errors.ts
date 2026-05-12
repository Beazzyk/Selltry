import axios from 'axios';

export function getRequestErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const backendMessage = (error.response?.data as { error?: string } | undefined)?.error;
    if (backendMessage) return backendMessage;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
