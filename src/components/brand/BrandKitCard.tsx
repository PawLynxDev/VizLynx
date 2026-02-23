"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <Card className="cursor-pointer transition-all hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">{name}</CardTitle>
            {isDefault && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Star className="h-3 w-3" />
                Default
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex gap-1.5">
            {colors.map((color, i) => (
              <div
                key={i}
                className="h-8 flex-1 rounded-md border border-gray-200"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="space-y-1 text-xs text-gray-500">
            <p>Heading: {fontHeading}</p>
            <p>Body: {fontBody}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
