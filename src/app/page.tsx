"use client";

import { useState } from "react";
import { BlogGrid } from "@/modules/blog/components";
import { PlatformList } from "@/modules/platform/components/PlatformList";

export default function HomePage() {
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>();

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-white border-r border-gray-200 p-4 fixed h-full">
        <h1 className="text-xl font-bold text-gray-900 mb-6">
          Tech Blog Archive
        </h1>
        <PlatformList
          selectedPlatformId={selectedPlatformId}
          onPlatformSelect={setSelectedPlatformId}
        />
      </aside>

      <main className="ml-64 flex-1 p-6">
        <BlogGrid platformId={selectedPlatformId} />
      </main>
    </div>
  );
}
