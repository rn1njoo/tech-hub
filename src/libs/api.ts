import { APIResponse } from "@/types";

export class APIError extends Error {
  constructor(public statusCode: number, message: string, public data?: any) {
    super(message);
    this.name = "APIError";
  }
}

export async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<APIResponse<T>> {
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new APIError(response.status, data.message || "API Error", data);
  }

  return data;
}
