import { useQuery } from "@tanstack/react-query";
import { fetchBlogPosts } from "../api";
import type { BlogPost } from "@/types/index";

interface UseBlogPostsParams {
  platformId?: string;
}

export const useBlogPosts = ({ platformId }: UseBlogPostsParams) => {
  return useQuery<BlogPost[]>({
    queryKey: ["posts", platformId],
    queryFn: () => fetchBlogPosts({ platformId }),
  });
};
