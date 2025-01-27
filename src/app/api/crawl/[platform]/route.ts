import { type NextRequest } from "next/server";
import { parser, BLOG_CONFIGS, extractFirstImage } from "@/libs/parser";

interface WPPost {
  id: number;
  title: { rendered: string };
  link: string;
  excerpt: { rendered: string };
  date: string;
  categories: number[];
  author_info?: { display_name: string };
  yoast_head_json?: { og_image?: { url: string }[] };
}

interface WPCategory {
  id: number;
  name: string;
}

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
const POSTS_PER_PAGE = 100;
const MONTHS_TO_FETCH = 5;

const postsCache = new Map<
  string,
  { data: ProcessedPost[]; timestamp: number }
>();

async function fetchWithErrorHandling(
  url: string,
  headers: Record<string, string>
) {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Fetch error:", {
      url,
      status: response.status,
      body: errorText,
    });
    throw new Error(`Failed to fetch from ${url}: HTTP ${response.status}`);
  }
  return response;
}

async function getCategoriesMap(
  headers: Record<string, string>
): Promise<Map<number, string>> {
  const url =
    "https://techblog.woowahan.com/wp-json/wp/v2/categories?per_page=100";
  const response = await fetchWithErrorHandling(url, headers);
  const categories: WPCategory[] = await response.json();
  return new Map(categories.map((cat) => [cat.id, cat.name]));
}

function processPost(
  post: WPPost,
  categoriesMap: Map<number, string>
): ProcessedPost {
  const categories = post.categories
    .map((catId) => categoriesMap.get(catId))
    .filter((name): name is string => Boolean(name));

  return {
    title: post.title.rendered,
    link: post.link,
    description: post.excerpt.rendered.replace(/<[^>]*>/g, ""),
    author: post.author_info?.display_name || "우아한형제들",
    publishedAt: post.date,
    categories,
    thumbnail: post.yoast_head_json?.og_image?.[0]?.url || "",
    platform: "woowa",
    techStacks: categories,
  };
}

async function fetchWordPressPosts(
  headers: Record<string, string>
): Promise<ProcessedPost[]> {
  const categoriesMap = await getCategoriesMap(headers);
  const monthsAgo = new Date();
  monthsAgo.setMonth(monthsAgo.getMonth() - MONTHS_TO_FETCH);
  const after = monthsAgo.toISOString();

  const initialUrl = `https://techblog.woowahan.com/wp-json/wp/v2/posts?per_page=${POSTS_PER_PAGE}&page=1&after=${after}`;
  const initialResponse = await fetchWithErrorHandling(initialUrl, headers);
  const firstPageData = (await initialResponse.json()) as WPPost[];
  const totalPages =
    Number(initialResponse.headers?.get("X-WP-TotalPages")) || 1;

  const posts = firstPageData.map((post) => processPost(post, categoriesMap));

  if (totalPages > 1) {
    const pagePromises = Array.from(
      { length: totalPages - 1 },
      (_, i) => i + 2
    ).map(async (page) => {
      const pageUrl = `https://techblog.woowahan.com/wp-json/wp/v2/posts?per_page=${POSTS_PER_PAGE}&page=${page}&after=${after}`;
      const pageResponse = await fetchWithErrorHandling(pageUrl, headers);
      const pageData = (await pageResponse.json()) as WPPost[];
      return pageData.map((post) => processPost(post, categoriesMap));
    });

    const additionalPosts = (await Promise.all(pagePromises)).flat();
    return [...posts, ...additionalPosts];
  }

  return posts;
}

async function fetchRSSPosts(platform: string): Promise<ProcessedPost[]> {
  const config = BLOG_CONFIGS[platform];
  if (!config?.feedUrl) {
    throw new Error(`Feed URL not found for platform: ${platform}`);
  }

  const feed = await parser.parseURL(config.feedUrl);
  const monthsAgo = new Date();
  monthsAgo.setMonth(monthsAgo.getMonth() - MONTHS_TO_FETCH);

  return feed.items
    .filter((item) => new Date(item.isoDate || "") > monthsAgo)
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
    const platform = url.pathname.split("/").pop(); // Extract platform from the URL path

    if (!platform) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing platform parameter",
          validPlatforms: [...Object.keys(BLOG_CONFIGS), "woowa"],
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!(platform in BLOG_CONFIGS) && platform !== "woowa") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid platform",
          validPlatforms: [...Object.keys(BLOG_CONFIGS), "woowa"],
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const headers = {
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0 (compatible)",
      "Content-Type": "application/json",
    };

    const fetchPosts =
      platform === "woowa"
        ? () => fetchWordPressPosts(headers)
        : () => fetchRSSPosts(platform);

    const { data, cached } = await getCachedPosts(platform, fetchPosts);

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
