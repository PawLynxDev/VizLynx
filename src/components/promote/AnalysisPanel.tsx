"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";
import { usePromotionStore } from "@/stores/promotionStore";

interface Props {
  onGenerate: () => void;
  onReanalyze: (tone: string) => void;
  generating: boolean;
  reanalyzing: boolean;
  brandKits?: Array<{ id: string; name: string }>;
  selectedBrandKitId?: string;
  onBrandKitChange?: (id: string | undefined) => void;
}

export function AnalysisPanel({
  onGenerate,
  onReanalyze,
  generating,
  reanalyzing,
  brandKits,
  selectedBrandKitId,
  onBrandKitChange,
}: Props) {
  const store = usePromotionStore();

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Left: Flux Prompt */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-violet-600" />
            AI Image Prompt
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            className="min-h-[120px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            value={store.editedFluxPrompt}
            onChange={(e) => store.setEditedFluxPrompt(e.target.value)}
            placeholder="Describe the marketing scene..."
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Tone:</span>
            {["professional", "playful", "luxury", "minimal"].map((tone) => (
              <button
                key={tone}
                onClick={() => onReanalyze(tone)}
                disabled={reanalyzing}
                className="rounded-full border px-2.5 py-0.5 text-xs capitalize transition-colors hover:border-violet-500 hover:text-violet-600"
              >
                {tone}
              </button>
            ))}
            {reanalyzing && <Loader2 className="h-3 w-3 animate-spin text-violet-600" />}
          </div>
        </CardContent>
      </Card>

      {/* Right: Marketing Text */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Marketing Copy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Headline</label>
            <Input
              value={store.editedHeadline}
              onChange={(e) => store.setEditedHeadline(e.target.value)}
              placeholder="Your headline here"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Subline</label>
            <Input
              value={store.editedSubline}
              onChange={(e) => store.setEditedSubline(e.target.value)}
              placeholder="Supporting text"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">CTA</label>
            <Input
              value={store.editedCta}
              onChange={(e) => store.setEditedCta(e.target.value)}
              placeholder="Shop Now"
            />
          </div>

          {brandKits && brandKits.length > 0 && (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Brand Kit</label>
              <select
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                value={selectedBrandKitId ?? ""}
                onChange={(e) => onBrandKitChange?.(e.target.value || undefined)}
              >
                <option value="">None</option>
                {brandKits.map((kit) => (
                  <option key={kit.id} value={kit.id}>
                    {kit.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button onClick={onGenerate} disabled={generating || !store.editedFluxPrompt} className="w-full">
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Image...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Image
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
