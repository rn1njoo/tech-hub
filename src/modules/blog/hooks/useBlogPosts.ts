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

  const posts = results
    .map((result) => result.data)
    .flat()
    .filter(Boolean) as BlogPost[];

  // 날짜 기준 내림차순 정렬
  const sortedPosts = posts.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return {
    data: sortedPosts,
    isLoading: results.some((result) => result.isLoading),
    error: results.some((result) => result.error),
  };
};
