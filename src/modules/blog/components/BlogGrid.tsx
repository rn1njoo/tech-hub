"use client";

import { useKurlyPosts } from "../hooks/useKurlyPosts";
import { BlogCard } from "./BlogCard";

interface BlogGridProps {
  platformId?: string;
}

export const BlogGrid = ({ platformId }: BlogGridProps) => {
  const { data: posts, isLoading, error } = useKurlyPosts();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">Error loading posts</div>
      </div>
    );
  }

  const filteredPosts = platformId
    ? posts?.filter((post) => post.platform === platformId)
    : posts;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredPosts?.map((post) => (
        <BlogCard key={post.link} post={post} />
      ))}
    </div>
  );
};
