import { BlogPost } from "@/types";

export async function fetchKurlyPosts(): Promise<BlogPost[]> {
  const response = await fetch("/api/crawl/kurly");

  if (!response.ok) {
    throw new Error("Failed to fetch Kurly blog posts");
  }

  const { data } = await response.json();
  return data;
}
