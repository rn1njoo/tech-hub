"use client";

import { useState } from "react";
import { BLOG_CONFIGS } from "@/libs/parser";
import { BlogGrid } from "@/modules/blog/components";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function HomePage() {
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>();
  const platforms = Object.values(BLOG_CONFIGS);

  return (
    <>
      <Header />
      <div className="flex min-h-screen pt-16">
        <Sidebar
          platforms={platforms}
          onPlatformSelect={setSelectedPlatformId}
        />
        <main className="ml-64 flex-1 p-6">
          <BlogGrid platformId={selectedPlatformId} />
        </main>
      </div>
    </>
  );
}
