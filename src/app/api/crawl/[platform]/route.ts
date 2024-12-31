import { NextResponse } from "next/server";
import { parser, BLOG_CONFIGS, extractFirstImage } from "@/libs/parser";

export async function GET(
  request: Request,
  { params }: { params: { platform: string } }
) {
  try {
    const config = BLOG_CONFIGS[params.platform];
    const feed = await parser.parseURL(config.feedUrl);

    const posts = feed.items.map((item) => ({
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
    console.error(`Error fetching ${params.platform} blog:`, error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}
