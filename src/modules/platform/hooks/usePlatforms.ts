import { useQuery } from "@tanstack/react-query";
import { fetchPlatforms } from "../api";
import type { Platform } from "@/types/index";

export const usePlatforms = () => {
  return useQuery<Platform[]>({
    queryKey: ["platforms"],
    queryFn: fetchPlatforms,
  });
};
