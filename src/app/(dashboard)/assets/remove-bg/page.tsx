"use client";

import { Eraser } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function RemoveBgAssetsPage() {
  const isLoading = false;
  const assets: any[] = [];

  return (
    <div>
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Eraser className="mb-4 h-16 w-16 text-gray-300" />
          <h2 className="mb-2 text-xl font-semibold text-gray-700">
            No background removal assets yet
          </h2>
          <p className="text-gray-500">
            Remove backgrounds from images to see them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* Assets will be rendered here */}
        </div>
      )}
    </div>
  );
}
