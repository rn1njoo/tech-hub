"use client";

import { useState } from "react";
import { BLOG_CONFIGS } from "@/libs/parser";
import { BlogGrid } from "@/modules/blog/components";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function HomePage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const platforms = Object.values(BLOG_CONFIGS);

  const handlePlatformSelect = (platformId: string) => {
    setSelectedPlatform(platformId);
  };

  const handleResetFilter = () => {
    setSelectedPlatform(null);
  };

  return (
    <>
      <Header onResetFilter={handleResetFilter} />
      <div className="flex min-h-screen pt-16">
        <Sidebar
          platforms={platforms}
          onPlatformSelect={handlePlatformSelect}
          selectedPlatform={selectedPlatform}
          setSelectedPlatform={setSelectedPlatform}
        />
        <main className="ml-64 flex-1 p-6">
          <BlogGrid platformId={selectedPlatform || undefined} />
        </main>
      </div>
    </>
  );
}
