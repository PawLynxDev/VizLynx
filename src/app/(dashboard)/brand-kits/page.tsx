"use client";

import Link from "next/link";
import { Plus, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BrandKitCard } from "@/components/brand/BrandKitCard";
import { trpc } from "@/lib/trpc";

export default function BrandKitsPage() {
  const { data: brandKits, isLoading } = trpc.brandKit.list.useQuery();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Brand Kits</h1>
            <p className="mt-1 text-gray-600">
              Manage your brand colors, fonts, and visual identity
            </p>
          </div>
          <Link href="/brand-kits/new">
            <Button className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl">
              <Plus className="mr-2 h-4 w-4" />
              Create Brand Kit
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-3xl" />
            ))}
          </div>
        ) : brandKits?.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-white py-24 shadow-sm">
            <div className="mb-6 inline-flex rounded-full bg-gradient-to-br from-blue-100 to-purple-100 p-6">
              <Palette className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">No brand kits yet</h3>
            <p className="mb-6 max-w-md text-center text-gray-600">
              Create a brand kit to apply consistent colors and fonts to your projects.
            </p>
            <Link href="/brand-kits/new">
              <Button className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Brand Kit
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {brandKits?.map((kit) => (
              <BrandKitCard key={kit.id} {...kit} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
