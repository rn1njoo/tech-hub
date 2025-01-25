import Image from "next/image";
import { BlogPost } from "@/types";
import { Card } from "@/components/UI";
import decodeHTML from "@/utils/decodeHTML";

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
        <div className="p-4">
          <h3 className="font-bold" style={{ fontSize: "1.8rem" }}>
            {post.title}
          </h3>
          <p className="text-sm text-gray-600">
            {decodeHTML(post.description)}
          </p>
          {/* <div className="flex flex-wrap gap-2">
            {post.techStacks.map((tech) => (
              <Badge key={tech} variant="tech" size="sm">
                {tech}
              </Badge>
            ))}
          </div> */}
          <div
            className="flex text-sm text-gray-500"
            style={{ justifyContent: "flex-end" }}
          >
            <span>
              {new Date(post.publishedAt).toLocaleDateString("ko-KR")}
            </span>
          </div>
        </div>
      </a>
    </Card>
  );
};
