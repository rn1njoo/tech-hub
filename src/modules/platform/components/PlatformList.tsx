import Image from "next/image";
import { Button } from "@/components/UI";
import { usePlatforms } from "../hooks/usePlatforms";

interface PlatformListProps {
  onPlatformSelect: (platformId: string) => void;
  selectedPlatformId?: string;
}

export const PlatformList = ({
  onPlatformSelect,
  selectedPlatformId,
}: PlatformListProps) => {
  const { data: platforms, isLoading } = usePlatforms();

  if (isLoading) return <div>Loading platforms...</div>;
  if (!platforms) return null;

  return (
    <div className="space-y-2">
      {platforms.map((platform) => (
        <Button
          key={platform.id}
          variant={selectedPlatformId === platform.id ? "primary" : "ghost"}
          className="w-full justify-start"
          onClick={() => onPlatformSelect(platform.id)}
        >
          <Image
            src={platform.icon}
            alt={platform.name}
            width={20}
            height={20}
            className="w-5 h-5 mr-2"
          />
          {platform.name}
        </Button>
      ))}
    </div>
  );
};
