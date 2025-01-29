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
  url: string;
  feedUrl?: string;
  icon?: string;
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
  inflab: {
    id: "inflab",
    name: "인프랩 테크",
    url: "https://tech.inflab.com/",
    feedUrl: "https://tech.inflab.com/rss.xml",
    icon: "/icons/inflab.png",
  },
  kurly: {
    id: "kurly",
    name: "컬리 테크",
    url: "https://helloworld.kurly.com/",
    feedUrl: "http://thefarmersfront.github.io/feed.xml",
    icon: "/icons/kurly.png",
  },
};

export function extractFirstImage(content: string): string | null {
  if (!content) return null;
  const match = content.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : null;
}
