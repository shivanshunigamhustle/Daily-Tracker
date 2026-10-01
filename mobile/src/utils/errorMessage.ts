interface AxiosLikeError {
  code?: string;
  response?: { status?: number; data?: { error?: { message?: string } } };
}

/**
 * Centralizes the "what do I show the user" logic for a failed API call,
 * so every screen's catch block doesn't re-derive it slightly differently.
 */
export function getErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  const error = err as AxiosLikeError;

  const serverMessage = error?.response?.data?.error?.message;
  if (serverMessage) return serverMessage;

  if (error?.response?.status === 401) {
    return "Your session has expired. Please log in again.";
  }

  if (error?.code === "ECONNABORTED") {
    return "The server took too long to respond. Check that the backend is running and reachable.";
  }

  if (!error?.response) {
    return "Could not reach the server. Check your network connection and API URL.";
  }

  return fallback;
}
