export interface Platform {
  id: string;
  name: string;
  icon: string;
}

export interface TechStack {
  id: string;
  name: string;
  category: "frontend" | "backend" | "devops" | "mobile" | "other";
}

export interface BlogPost {
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

export interface APIResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export const PLATFORMS = {
  KURLY: "kurly",
} as const;
