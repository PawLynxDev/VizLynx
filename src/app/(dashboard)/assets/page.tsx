"use client";

import { ImageIcon, Video, Palette } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";

export default function AllAssetsPage() {
  // TODO: Replace with actual assets query
  const { data: projects, isLoading } = trpc.project.list.useQuery();

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
      ) : projects?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ImageIcon className="mb-4 h-16 w-16 text-gray-300" />
          <h2 className="mb-2 text-xl font-semibold text-gray-700">
            No assets yet
          </h2>
          <p className="text-gray-500">
            Create content using Promote, Remove BG, or Brand Kits to see your assets here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects?.map((project) => (
            <div
              key={project.id}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
            >
              <div className="aspect-square bg-gray-100 p-4">
                {/* Placeholder for asset preview */}
                <div className="flex h-full items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900">{project.name}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
