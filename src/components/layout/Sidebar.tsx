import Image from "next/image";
import { useState } from "react";
import { Button } from "../UI/Button";

interface Platform {
  id: string;
  name: string;
  icon: string;
}

interface SidebarProps {
  platforms: Platform[];
  onPlatformSelect: (platformId: string) => void;
}

export const Sidebar = ({ platforms, onPlatformSelect }: SidebarProps) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const handlePlatformClick = (platformId: string) => {
    setSelectedPlatform(platformId);
    onPlatformSelect(platformId);
  };

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 p-4">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">최신글</h2>
          <div className="space-y-2">
            {/* 최신글 리스트 컴포넌트가 들어갈 자리 */}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">플랫폼</h2>
          <div className="space-y-2">
            {platforms.map((platform) => (
              <Button
                key={platform.id}
                variant={selectedPlatform === platform.id ? "primary" : "ghost"}
                className="w-full justify-start"
                onClick={() => handlePlatformClick(platform.id)}
              >
                <Image
                  src={platform.icon}
                  alt={platform.name}
                  width={20}
                  height={20}
                  className="mr-2"
                />
                {platform.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
