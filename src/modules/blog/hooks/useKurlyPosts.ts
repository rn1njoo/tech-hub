import { useQuery } from "@tanstack/react-query";
import { fetchKurlyPosts } from "@/libs/crawlers/kurly";

export function useKurlyPosts() {
  return useQuery({
    queryKey: ["kurlyPosts"],
    queryFn: fetchKurlyPosts,
    staleTime: 1000 * 60 * 5,
  });
}
