"use client";

import { useBlogPosts } from "../hooks/useBlogPosts";
import { BlogCard } from "./BlogCard";

interface BlogGridProps {
  platformId?: string;
}

export const BlogGrid = ({ platformId }: BlogGridProps) => {
  const { data: posts, isLoading, error } = useBlogPosts(platformId);

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts?.map((post) => (
        <BlogCard key={post.link} post={post} />
      ))}
    </div>
  );
};
