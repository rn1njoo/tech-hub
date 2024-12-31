import type { BlogPost } from "@/types";

export async function fetchBlogPosts(platform: string): Promise<BlogPost[]> {
  const response = await fetch(`/api/crawl/${platform}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${platform} blog posts`);
  }

  const { data } = await response.json();
  return data;
}
