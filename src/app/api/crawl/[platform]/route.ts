import { type NextRequest } from "next/server";
import { parser, BLOG_CONFIGS, extractFirstImage } from "@/libs/parser";

interface ProcessedPost {
  title: string;
  link: string;
  description: string;
  author: string;
  publishedAt: string;
  categories: string[];
  thumbnail: string;
  platform: string;
  techStacks: string[];
}

const CACHE_DURATION = 1000 * 60 * 60 * 4;

const postsCache = new Map<
  string,
  { data: ProcessedPost[]; timestamp: number }
>();

async function fetchRSSPosts(platform: string): Promise<ProcessedPost[]> {
  const config = BLOG_CONFIGS[platform];
  if (!config?.feedUrl) {
    throw new Error(`Feed URL not found for platform: ${platform}`);
  }

  const feed = await parser.parseURL(config.feedUrl);
  const startData = new Date("2023-01-01");

  return feed.items
    .filter((item) => new Date(item.isoDate || "") >= startData)
    .map((item) => ({
      title: item.title,
      link: item.link,
      description: item.contentSnippet || "",
      author: item.creator || "",
      publishedAt: item.isoDate || "",
      categories: item.categories || [],
      thumbnail: extractFirstImage(item.content) || "",
      platform: config.id,
      techStacks: item.categories || [],
    }));
}

async function getCachedPosts(
  platform: string,
  fetchFn: () => Promise<ProcessedPost[]>
) {
  const cached = postsCache.get(platform);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return { data: cached.data, cached: true };
  }

  const posts = await fetchFn();
  postsCache.set(platform, { data: posts, timestamp: Date.now() });
  return { data: posts, cached: false };
}

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const url = new URL(request.url);
    const platform = url.pathname.split("/").pop();

    if (!platform) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing platform parameter",
          validPlatforms: Object.keys(BLOG_CONFIGS),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!(platform in BLOG_CONFIGS)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid platform",
          validPlatforms: Object.keys(BLOG_CONFIGS),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { data, cached } = await getCachedPosts(platform, () =>
      fetchRSSPosts(platform)
    );

    return new Response(
      JSON.stringify({
        success: true,
        data,
        cached,
        totalPosts: data.length,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("API Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to fetch blog posts",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
