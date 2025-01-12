import { NextResponse } from "next/server";
import { parser, BLOG_CONFIGS, extractFirstImage } from "@/libs/parser";

interface WPPost {
  id: number;
  title: {
    rendered: string;
  };
  link: string;
  excerpt: {
    rendered: string;
  };
  date: string;
  categories: number[];
  author_info?: {
    display_name: string;
  };
  yoast_head_json?: {
    og_image?: {
      url: string;
    }[];
  };
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

let postsCache = {
  data: null as ProcessedPost[] | null,
  timestamp: null as number | null,
  CACHE_DURATION: 1000 * 60 * 60 * 4,
};

async function getCategoriesMap(headers: any): Promise<Map<number, string>> {
  const response = await fetch(
    "https://techblog.woowahan.com/wp-json/wp/v2/categories?per_page=100",
    { headers }
  );
  const categories = (await response.json()) as WPCategory[];
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

export async function GET(
  request: Request,
  { params }: { params: { platform: string } }
) {
  try {
    const platform = params.platform;
    let posts: ProcessedPost[] = [];

    if (platform === "woowa") {
      if (
        postsCache.data &&
        postsCache.timestamp &&
        Date.now() - postsCache.timestamp < postsCache.CACHE_DURATION
      ) {
        return NextResponse.json({
          success: true,
          data: postsCache.data,
          cached: true,
        });
      }

      const perPage = 100;
      const headers = {
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Content-Type": "application/json",
      };

      const categoriesMap = await getCategoriesMap(headers);

      const initialResponse = await fetch(
        `https://techblog.woowahan.com/wp-json/wp/v2/posts?per_page=${perPage}&page=1`,
        { headers }
      );

      if (!initialResponse.ok) {
        const errorText = await initialResponse.text();
        console.error("Initial response error:", {
          status: initialResponse.status,
          body: errorText,
        });
        throw new Error(
          `Failed to fetch first page: ${initialResponse.status}`
        );
      }

      const firstPageData = (await initialResponse.json()) as WPPost[];
      const totalPages =
        Number(initialResponse.headers.get("X-WP-TotalPages")) || 1;

      const processedFirstPage = firstPageData.map((post) =>
        processPost(post, categoriesMap)
      );
      posts = [...processedFirstPage];

      if (totalPages > 1) {
        const remainingPages = Array.from(
          { length: totalPages - 1 },
          (_, i) => i + 2
        );

        const pagePromises = remainingPages.map(async (page) => {
          try {
            await new Promise((resolve) => setTimeout(resolve, 200));

            const pageResponse = await fetch(
              `https://techblog.woowahan.com/wp-json/wp/v2/posts?per_page=${perPage}&page=${page}`,
              { headers }
            );

            if (!pageResponse.ok) return [];

            const pageData = (await pageResponse.json()) as WPPost[];
            return pageData.map((post) => processPost(post, categoriesMap));
          } catch (error) {
            console.error(`Error fetching page ${page}:`, error);
            return [];
          }
        });

        const pagesResults = await Promise.all(pagePromises);
        posts = [...posts, ...pagesResults.flat()];
      }

      postsCache.data = posts;
      postsCache.timestamp = Date.now();
    } else {
      const config = BLOG_CONFIGS[platform];
      if (!config?.feedUrl) {
        throw new Error(`Feed URL not found for platform: ${platform}`);
      }

      const feed = await parser.parseURL(config.feedUrl);
      posts = feed.items.map((item) => ({
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

    return NextResponse.json({
      success: true,
      data: posts,
    });
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
