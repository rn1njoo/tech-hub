import { NextResponse } from "next/server";
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
let postsCache: { data: ProcessedPost[] | null; timestamp: number | null } = {
  data: null,
  timestamp: null,
};

async function fetchData(
  url: string,
  headers: Record<string, string>
): Promise<Response> {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Fetch error:", {
      url,
      status: response.status,
      body: errorText,
    });
    throw new Error(`Failed to fetch data: ${response.status}`);
  }
  return response;
}

async function getCategoriesMap(
  headers: Record<string, string>
): Promise<Map<number, string>> {
  const url =
    "https://techblog.woowahan.com/wp-json/wp/v2/categories?per_page=100";
  const response = await fetchData(url, headers);
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
  const perPage = 100;
  const initialUrl = `https://techblog.woowahan.com/wp-json/wp/v2/posts?per_page=${perPage}&page=1`;

  const initialResponse = await fetchData(initialUrl, headers);
  const firstPageData = (await initialResponse.json()) as WPPost[];
  const totalPages =
    Number(initialResponse.headers?.get("X-WP-TotalPages")) || 1;

  const posts = firstPageData.map((post) => processPost(post, categoriesMap));

  if (totalPages > 1) {
    const pagePromises = Array.from(
      { length: totalPages - 1 },
      (_, i) => i + 2
    ).map(async (page) => {
      const pageUrl = `https://techblog.woowahan.com/wp-json/wp/v2/posts?per_page=${perPage}&page=${page}`;
      const pageResponse = await fetchData(pageUrl, headers);
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
  return feed.items.map((item) => ({
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

export async function GET(
  request: Request,
  { params }: { params: { platform: string } }
) {
  try {
    const { platform } = params;
    let posts: ProcessedPost[] = [];

    if (platform === "woowa") {
      if (
        postsCache.data &&
        postsCache.timestamp &&
        Date.now() - postsCache.timestamp < CACHE_DURATION
      ) {
        return NextResponse.json({
          success: true,
          data: postsCache.data,
          cached: true,
        });
      }

      const headers = {
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Content-Type": "application/json",
      };

      posts = await fetchWordPressPosts(headers);
      postsCache = { data: posts, timestamp: Date.now() };
    } else {
      posts = await fetchRSSPosts(platform);
    }

    return NextResponse.json({ success: true, data: posts });
  } catch (error) {
    console.error(`Error fetching ${params.platform} blog:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch blog posts",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
