import Parser from "rss-parser";

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

type BlogConfig = {
  id: string;
  name: string;
  feedUrl?: string;
};

type BlogConfigs = {
  [key: string]: BlogConfig;
};

export const parser: Parser<CustomFeed, CustomItem> = new Parser({
  customFields: {
    item: ["categories", "creator", "content", "contentSnippet"],
  },
});

export const BLOG_CONFIGS: BlogConfigs = {
  woowa: {
    id: "woowa",
    name: "우아한형제들 기술블로그",
  },
  kurly: {
    id: "kurly",
    name: "컬리 테크",
    feedUrl: "http://thefarmersfront.github.io/feed.xml",
  },
};

export function extractFirstImage(content: string): string | null {
  if (!content) return null;
  const match = content.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : null;
}
