"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface BrandKitCardProps {
  id: string;
  name: string;
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  colorBackground: string;
  colorText: string;
  fontHeading: string;
  fontBody: string;
  isDefault: boolean;
}

export function BrandKitCard({
  id,
  name,
  colorPrimary,
  colorSecondary,
  colorAccent,
  colorBackground,
  colorText,
  fontHeading,
  fontBody,
  isDefault,
}: BrandKitCardProps) {
  const colors = [colorPrimary, colorSecondary, colorAccent, colorBackground, colorText];

  return (
    <Link href={`/brand-kits/${id}`}>
      <div className="group cursor-pointer overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">{name}</h3>
            {isDefault && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Star className="h-3 w-3" />
                Default
              </Badge>
            )}
          </div>

          <div className="mb-4 flex gap-2">
            {colors.map((color, i) => (
              <div
                key={i}
                className="h-10 flex-1 rounded-xl border-2 border-white shadow-sm"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <div className="space-y-1.5 text-sm text-gray-500">
            <p className="truncate">Heading: <span className="text-gray-700">{fontHeading}</span></p>
            <p className="truncate">Body: <span className="text-gray-700">{fontBody}</span></p>
          </div>
        </div>
      </div>
    </Link>
  );
}
