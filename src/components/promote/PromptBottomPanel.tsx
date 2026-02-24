"use client";

import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePromotionStore } from "@/stores/promotionStore";
import { cn } from "@/lib/utils";

interface PromptBottomPanelProps {
  onGenerate: () => void;
  onReanalyze: (tone: string) => void;
  generating: boolean;
  reanalyzing: boolean;
  brandKits?: Array<{ id: string; name: string }>;
  selectedBrandKitId?: string;
  onBrandKitChange?: (id: string | undefined) => void;
}

const TONES = [
  { id: "professional", label: "Professional" },
  { id: "playful", label: "Playful" },
  { id: "luxury", label: "Luxury" },
  { id: "minimal", label: "Minimal" },
];

export function PromptBottomPanel({
  onGenerate,
  onReanalyze,
  generating,
  reanalyzing,
  brandKits,
  selectedBrandKitId,
  onBrandKitChange,
}: PromptBottomPanelProps) {
  const store = usePromotionStore();

  return (
    <div className="sticky bottom-0 left-0 right-0 border-t border-gray-200 bg-white/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="mx-auto max-w-7xl space-y-4">
          {/* Tone Buttons Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Tone:</span>
              {TONES.map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => onReanalyze(tone.id)}
                  disabled={reanalyzing}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-xs font-medium transition-all duration-200",
                    "hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700",
                    "disabled:cursor-not-allowed disabled:opacity-50"
                  )}
                >
                  {tone.label}
                </button>
              ))}
              {reanalyzing && (
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              )}
            </div>

            {/* Brand Kit Selector */}
            {brandKits && brandKits.length > 0 && onBrandKitChange && (
              <select
                value={selectedBrandKitId || ""}
                onChange={(e) => onBrandKitChange(e.target.value || undefined)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="">No Brand Kit</option>
                {brandKits.map((kit) => (
                  <option key={kit.id} value={kit.id}>
                    {kit.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Prompt Input and Generate Button */}
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="mb-2 block text-xs font-medium text-gray-700">
                Image Generation Prompt
              </label>
              <textarea
                value={store.editedFluxPrompt}
                onChange={(e) => store.setEditedFluxPrompt(e.target.value)}
                placeholder="Describe the scene you imagine..."
                className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-6 py-4 text-sm transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                rows={3}
              />
            </div>

            <Button
              onClick={onGenerate}
              disabled={!store.editedFluxPrompt || generating}
              className="h-[120px] rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 font-semibold shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
