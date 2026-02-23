"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Type } from "lucide-react";

interface Props {
  fluxImageUrl: string;
  onRegenerate: () => void;
  onApplyText: () => void;
  regenerating: boolean;
  applyingText: boolean;
  textPosition: "top" | "center" | "bottom";
  onTextPositionChange: (pos: "top" | "center" | "bottom") => void;
}

export function FluxPreview({
  fluxImageUrl,
  onRegenerate,
  onApplyText,
  regenerating,
  applyingText,
  textPosition,
  onTextPositionChange,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Generated Image</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <img
          src={fluxImageUrl}
          alt="Generated"
          className="w-full rounded-lg object-contain"
          style={{ maxHeight: 500 }}
        />

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Text position:</span>
          {(["top", "center", "bottom"] as const).map((pos) => (
            <button
              key={pos}
              onClick={() => onTextPositionChange(pos)}
              className={`rounded-md border px-3 py-1 text-xs capitalize transition-colors ${
                textPosition === pos
                  ? "border-violet-500 bg-violet-50 text-violet-700"
                  : "hover:border-gray-400"
              }`}
            >
              {pos}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <Button onClick={onApplyText} disabled={applyingText}>
            <Type className="mr-2 h-4 w-4" />
            {applyingText ? "Applying..." : "Apply Text"}
          </Button>
          <Button variant="outline" onClick={onRegenerate} disabled={regenerating}>
            <RefreshCw className={`mr-2 h-4 w-4 ${regenerating ? "animate-spin" : ""}`} />
            Regenerate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
