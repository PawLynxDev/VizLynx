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
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-white py-24 shadow-sm">
          <div className="mb-6 inline-flex rounded-full bg-gradient-to-br from-blue-100 to-purple-100 p-6">
            <ImageIcon className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-gray-900">
            No assets yet
          </h3>
          <p className="max-w-md text-center text-gray-600">
            Create content using Promote, Remove BG, or Brand Kits to see your assets here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects?.map((project) => (
            <div
              key={project.id}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <div className="aspect-square bg-gray-50 p-6">
                {/* Placeholder for asset preview */}
                <div className="flex h-full items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-gray-300" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{project.name}</h3>
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
