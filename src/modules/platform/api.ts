import type { Platform } from "@/types";

export const fetchPlatforms = async (): Promise<Platform[]> => {
  const response = await fetch("/api/platforms");

  if (!response.ok) {
    throw new Error("Failed to fetch platforms");
  }

  return response.json();
};
