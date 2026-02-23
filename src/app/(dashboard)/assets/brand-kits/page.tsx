"use client";

import { Palette } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";

export default function BrandKitsAssetsPage() {
  const { data: brandKits, isLoading } = trpc.brandKit.list.useQuery();

  return (
    <div>
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : brandKits?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Palette className="mb-4 h-16 w-16 text-gray-300" />
          <h2 className="mb-2 text-xl font-semibold text-gray-700">
            No brand kits yet
          </h2>
          <p className="text-gray-500">
            Create brand kits to see them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {brandKits?.map((kit) => (
            <div
              key={kit.id}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
            >
              <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 p-6">
                <div className="flex h-full flex-col justify-between">
                  <div className="flex gap-2">
                    {kit.colors.slice(0, 4).map((color, idx) => (
                      <div
                        key={idx}
                        className="h-8 w-8 rounded-full border-2 border-white shadow"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  {kit.logoUrl && (
                    <div className="rounded-lg bg-white p-2 shadow">
                      <img
                        src={kit.logoUrl}
                        alt={kit.name}
                        className="h-12 w-12 object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900">{kit.name}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {kit.colors.length} colors
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
