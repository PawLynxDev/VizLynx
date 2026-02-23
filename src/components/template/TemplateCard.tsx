"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TemplateConfig } from "@/types";

interface TemplateCardProps {
  id: string;
  name: string;
  description: string;
  category: string;
  config: TemplateConfig;
  selected: boolean;
  onClick: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  social: "Social Post",
  story: "Story",
  ad: "Ad Banner",
  product: "Product",
  promo: "Promo",
  general: "General",
};

function ConfigPreview({ config }: { config: TemplateConfig }) {
  const bg = config.background;
  const style: React.CSSProperties = {};

  if (bg.type === "gradient" && bg.colors) {
    const dir = bg.direction?.replace("to ", "") ?? "bottom";
    // Replace semantic slots with placeholder colors for preview
    const colors = bg.colors.map((c) =>
      c.startsWith("{{") ? "#8b8b8b" : c
    );
    style.background = `linear-gradient(to ${dir}, ${colors.join(", ")})`;
  } else {
    const color = bg.color?.startsWith("{{") ? "#e5e5e5" : bg.color;
    style.backgroundColor = color ?? "#f3f4f6";
  }

  const aspect = config.width / config.height;

  return (
    <div
      className="flex items-center justify-center rounded-lg"
      style={{
        ...style,
        aspectRatio: aspect > 1.2 ? "16/9" : aspect < 0.8 ? "9/16" : "1/1",
        maxHeight: 160,
      }}
    >
      <div className="flex flex-col items-center gap-1 px-4 text-center">
        <div className="h-6 w-16 rounded bg-white/30" />
        <div className="h-3 w-24 rounded bg-white/20" />
      </div>
    </div>
  );
}

export function TemplateCard({
  name,
  description,
  category,
  config,
  selected,
  onClick,
}: TemplateCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all",
        selected ? "ring-2 ring-violet-500 shadow-md" : "hover:shadow-md"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{name}</CardTitle>
          {selected && <Check className="h-4 w-4 text-violet-500" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-2">
          <ConfigPreview config={config} />
        </div>
        <p className="text-xs text-gray-500">{description}</p>
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {CATEGORY_LABELS[category] ?? category}
          </Badge>
          <span className="text-xs text-gray-400">
            {config.width}x{config.height}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
