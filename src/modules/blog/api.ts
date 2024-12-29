import type { BlogPost } from "@/types/index";

interface FetchBlogPostsParams {
  platformId?: string;
}

export const fetchBlogPosts = async ({
  platformId,
}: FetchBlogPostsParams): Promise<BlogPost[]> => {
  const response = await fetch(
    `/api/posts${platformId ? `?platformId=${platformId}` : ""}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }

  return response.json();
};
