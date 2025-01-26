"use client";

import Image from "next/image";
import { useBlogPosts } from "../hooks/useBlogPosts";
import { BlogCard } from "./BlogCard";
import { BLOG_CONFIGS } from "@/libs/parser";

interface BlogGridProps {
  platformId?: string;
}

export const BlogGrid = ({ platformId }: BlogGridProps) => {
  const { data: posts, isLoading } = useBlogPosts(platformId);
  const platform = BLOG_CONFIGS[platformId as keyof typeof BLOG_CONFIGS];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  return (
    <div className="space-y-8">
      {platform && (
        <div className=" rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-8">
            <Image
              src={platform.icon || "/default-icon.png"}
              alt={platform.name}
              width={180}
              height={180}
            />
            <div className="flex-1" style={{ marginLeft: "30px" }}>
              <h2 className="font-bold" style={{ fontSize: "2.5rem" }}>
                {platform.name}
              </h2>
              <div className="text-gray-500 text-sm">
                아티클 | {posts?.length || 0}개
              </div>
            </div>
          </div>
          {/* <a
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
                >
                  <span className="text-sm">웹사이트 방문</span>
                  <ExternalLink className="w-4 h-4" />
                </a> */}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {posts?.map((post) => (
          <BlogCard key={post.link} post={post} />
        ))}
      </div>
    </div>
  );
};
