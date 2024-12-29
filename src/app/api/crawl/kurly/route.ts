import Parser from "rss-parser";
import { NextResponse } from "next/server";

type CustomFeed = {
  title: string;
  description: string;
  link: string;
};

type CustomItem = {
  title: string;
  link: string;
  content: string;
  contentSnippet?: string;
  categories?: string[];
  isoDate?: string;
  creator?: string;
};

const parser: Parser<CustomFeed, CustomItem> = new Parser({
  customFields: {
    item: ["categories", "creator", "content", "contentSnippet"],
  },
});

export async function GET() {
  try {
    const feed = await parser.parseURL(
      "http://thefarmersfront.github.io/feed.xml"
    );

    const posts = feed.items.map((item) => ({
      title: item.title,
      link: item.link,
      description: item.contentSnippet || "",
      author: item.creator || "",
      publishedAt: item.isoDate || "",
      categories: item.categories || [],
      // HTML 콘텐츠에서 첫 번째 이미지 URL 추출
      thumbnail: extractFirstImage(item.content) || "",
      platform: "kurly",
      techStacks: item.categories || [],
    }));

    return NextResponse.json({
      success: true,
      data: posts,
      source: {
        title: feed.title,
        description: feed.description,
        link: feed.link,
      },
    });
  } catch (error) {
    console.error("Error fetching Kurly blog:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch blog posts",
      },
      { status: 500 }
    );
  }
}

function extractFirstImage(content: string): string | null {
  const match = content?.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : null;
}
