import { type NextRequest } from "next/server";
import { parser, BLOG_CONFIGS, extractFirstImage } from "@/libs/parser";

// interface WPPost {
//   id: number;
//   title: { rendered: string };
//   link: string;
//   excerpt: { rendered: string };
//   date: string;
//   categories: number[];
//   author_info?: { display_name: string };
//   yoast_head_json?: { og_image?: { url: string }[] };
// }

// interface WPCategory {
//   id: number;
//   name: string;
// }

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
const MONTHS_TO_FETCH = 5;

const postsCache = new Map<
  string,
  { data: ProcessedPost[]; timestamp: number }
>();

// async function fetchWithErrorHandling(
//   url: string,
//   headers: Record<string, string>
// ) {
//   const response = await fetch(url, { headers });
//   if (!response.ok) {
//     const errorText = await response.text();
//     console.error("Fetch error:", {
//       url,
//       status: response.status,
//       body: errorText,
//     });
//     throw new Error(`Failed to fetch from ${url}: HTTP ${response.status}`);
//   }
//   return response;
// }

// async function getCategoriesMap(
//   headers: Record<string, string>
// ): Promise<Map<number, string>> {
//   const url =
//     "https://techblog.woowahan.com/wp-json/wp/v2/categories?per_page=100";
//   const response = await fetchWithErrorHandling(url, headers);
//   const categories: WPCategory[] = await response.json();
//   return new Map(categories.map((cat) => [cat.id, cat.name]));
// }

// function processPost(
//   post: WPPost,
//   categoriesMap: Map<number, string>
// ): ProcessedPost {
//   const categories = post.categories
//     .map((catId) => categoriesMap.get(catId))
//     .filter((name): name is string => Boolean(name));

//   return {
//     title: post.title.rendered,
//     link: post.link,
//     description: post.excerpt.rendered.replace(/<[^>]*>/g, ""),
//     author: post.author_info?.display_name || "우아한형제들",
//     publishedAt: post.date,
//     categories,
//     thumbnail: post.yoast_head_json?.og_image?.[0]?.url || "",
//     platform: "woowa",
//     techStacks: categories,
//   };
// }

async function fetchWoowaRSSPosts(): Promise<ProcessedPost[]> {
  // RSS 메인 피드
  const MAIN_FEED_URL = "https://techblog.woowahan.com/feed/";
  // 페이지별 피드 (WordPress에서 제공)
  const PAGE_FEED_URL = "https://techblog.woowahan.com/feed/?paged=";

  console.log("Starting to fetch Woowa RSS posts..."); // 함수 시작

  const monthsAgo = new Date();
  monthsAgo.setMonth(monthsAgo.getMonth() - MONTHS_TO_FETCH);

  let allPosts: ProcessedPost[] = [];
  let page = 1;
  let shouldContinue = true;

  while (shouldContinue && page <= 10) {
    try {
      const feedUrl = page === 1 ? MAIN_FEED_URL : `${PAGE_FEED_URL}${page}`;
      console.log(`Fetching page ${page} from: ${feedUrl}`); // URL 로깅

      const feed = await parser.parseURL(feedUrl);
      console.log(`Page ${page} feed items count:`, feed.items.length); // 각 페이지의 아이템 수

      const posts = feed.items
        .filter((item) => new Date(item.isoDate || "") > monthsAgo)
        .map((item) => ({
          title: item.title,
          link: item.link,
          description: item.contentSnippet || "",
          author: item.creator || "우아한형제들",
          publishedAt: item.isoDate || "",
          categories: item.categories || [],
          thumbnail: extractFirstImage(item.content) || "",
          platform: "woowa",
          techStacks: item.categories || [],
        }));

      console.log(`Page ${page} filtered posts count:`, posts.length); // 필터링 후 포스트 수

      if (posts.length === 0) {
        console.log(`No posts found on page ${page}, stopping pagination`); // 페이지네이션 중단 로그
        shouldContinue = false;
      } else {
        allPosts = [...allPosts, ...posts];
        console.log("Total posts collected so far:", allPosts.length); // 누적 포스트 수
      }

      page++;
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error);
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
        });
      } else {
        console.error("Unknown error type:", error);
      }
      break;
    }
  }

  console.log("Final total posts:", allPosts.length); // 최종 포스트 수
  return allPosts;
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

    const fetchPosts =
      platform === "woowa"
        ? () => fetchWoowaRSSPosts()
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
