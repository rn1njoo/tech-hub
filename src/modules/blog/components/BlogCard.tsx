import Image from "next/image";
import { BlogPost } from "@/types";
import { Card, Badge } from "@/components/UI";

interface BlogCardProps {
  post: BlogPost;
}

export const BlogCard = ({ post }: BlogCardProps) => {
  return (
    <Card>
      <a
        href={post.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full"
      >
        {post.thumbnail && (
          <div className="aspect-video relative overflow-hidden">
            <Image
              src={post.thumbnail}
              alt=""
              layout="fill"
              objectFit="cover"
              className="transform hover:scale-105 transition-transform duration-200"
            />
          </div>
        )}
        <div className="p-4 space-y-3">
          <h3 className="text-lg font-semibold line-clamp-2 hover:text-blue-600">
            {post.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-3">
            {post.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {post.techStacks.map((tech) => (
              <Badge key={tech} variant="tech" size="sm">
                {tech}
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{post.author}</span>
            <span>
              {new Date(post.publishedAt).toLocaleDateString("ko-KR")}
            </span>
          </div>
        </div>
      </a>
    </Card>
  );
};
