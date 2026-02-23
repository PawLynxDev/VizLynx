"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Sparkles, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useEditorStore } from "@/stores/editorStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CopyGeneratorProps {
  projectId: string;
}

const TONES = [
  { value: "professional" as const, label: "Professional" },
  { value: "casual" as const, label: "Casual" },
  { value: "bold" as const, label: "Bold" },
  { value: "playful" as const, label: "Playful" },
];

export function CopyGenerator({ projectId }: CopyGeneratorProps) {
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [tone, setTone] = useState<"professional" | "casual" | "bold" | "playful">("professional");

  const { copyVariations, selectedCopyVariation, setCopyVariations, selectCopyVariation } =
    useEditorStore();

  const copyMutation = trpc.generation.generateCopy.useMutation({
    onSuccess: (data) => {
      setCopyVariations(data);
      toast.success("Generated 3 copy variations");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleGenerate = () => {
    if (!productName.trim()) {
      toast.error("Enter a product name");
      return;
    }
    copyMutation.mutate({
      projectId,
      productName: productName.trim(),
      productDescription: productDescription.trim(),
      tone,
    });
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">AI Copy Generator</h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-gray-500">Product Name</label>
          <Input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g., Summer Dress"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Description (optional)</label>
          <Input
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            placeholder="e.g., Flowy cotton dress"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {TONES.map((t) => (
          <button
            key={t.value}
            onClick={() => setTone(t.value)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              tone === t.value
                ? "bg-violet-100 text-violet-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Button
        onClick={handleGenerate}
        disabled={!productName.trim() || copyMutation.isPending}
        variant="outline"
        size="sm"
        className="w-full"
      >
        {copyMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            Generate AI Copy
          </>
        )}
      </Button>

      {copyVariations.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">Pick a variation:</p>
          {copyVariations.map((variation, i) => (
            <Card
              key={i}
              className={cn(
                "cursor-pointer transition-all",
                selectedCopyVariation === i
                  ? "ring-2 ring-violet-500"
                  : "hover:shadow-sm"
              )}
              onClick={() => selectCopyVariation(i)}
            >
              <CardContent className="flex items-start gap-2 py-2 px-3">
                <div className="mt-0.5">
                  {selectedCopyVariation === i ? (
                    <Check className="h-3.5 w-3.5 text-violet-500" />
                  ) : (
                    <span className="inline-block h-3.5 w-3.5 rounded-full border border-gray-300" />
                  )}
                </div>
                <div className="flex-1 space-y-0.5">
                  {Object.entries(variation.texts).map(([idx, text]) => (
                    <p key={idx} className="text-xs text-gray-700">
                      <span className="text-gray-400">#{Number(idx) + 1}:</span> {text}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
