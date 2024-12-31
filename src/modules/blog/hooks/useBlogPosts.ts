import { useQueries } from "@tanstack/react-query";
import { BLOG_CONFIGS } from "@/libs/parser";
import { fetchBlogPosts } from "../api";
import type { BlogPost } from "@/types";

export const useBlogPosts = (platform?: string) => {
  const platforms = platform ? [platform] : Object.keys(BLOG_CONFIGS);

  const results = useQueries({
    queries: platforms.map((platform) => ({
      queryKey: ["posts", platform],
      queryFn: () => fetchBlogPosts(platform),
      staleTime: 1000 * 60 * 5,
    })),
  });

  return {
    data: results.map((result) => result.data).flat() as BlogPost[],
    isLoading: results.some((result) => result.isLoading),
    error: results.some((result) => result.error),
  };
};
