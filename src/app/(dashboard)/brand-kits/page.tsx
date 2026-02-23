"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BrandKitCard } from "@/components/brand/BrandKitCard";
import { trpc } from "@/lib/trpc";

export default function BrandKitsPage() {
  const { data: brandKits, isLoading } = trpc.brandKit.list.useQuery();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Brand Kits</h1>
        <Link href="/brand-kits/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Brand Kit
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : brandKits?.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center">
          <p className="text-gray-500">No brand kits yet</p>
          <p className="mt-1 text-sm text-gray-400">
            Create a brand kit to apply consistent colors and fonts to your projects.
          </p>
          <Link href="/brand-kits/new">
            <Button className="mt-4" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Brand Kit
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brandKits?.map((kit) => (
            <BrandKitCard key={kit.id} {...kit} />
          ))}
        </div>
      )}
    </div>
  );
}
