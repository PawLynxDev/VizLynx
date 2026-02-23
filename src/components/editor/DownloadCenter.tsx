"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Loader2, ImagePlus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useEditorStore } from "@/stores/editorStore";
import { toast } from "sonner";
import { EXPORT_SIZES } from "@/types";
import { cn } from "@/lib/utils";

interface DownloadCenterProps {
  projectId: string;
  projectName: string;
}

export function DownloadCenter({ projectId, projectName }: DownloadCenterProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const editor = useEditorStore();

  const { data: results, isLoading } = trpc.generation.getResults.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  const utils = trpc.useUtils();

  const batchMutation = trpc.generation.generateBatch.useMutation({
    onSuccess: () => {
      toast.success("Generated missing sizes");
      utils.generation.getResults.invalidate({ projectId });
      utils.project.getById.invalidate({ id: projectId });
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading || !results || results.length === 0) return null;

  // Group results by size
  const sizeMap = new Map<string, typeof results>();
  for (const r of results) {
    const key = `${r.width}x${r.height}`;
    if (!sizeMap.has(key)) sizeMap.set(key, []);
    sizeMap.get(key)!.push(r);
  }

  // Determine which sizes are missing
  const generatedDimensions = new Set(
    results.map((r) => `${r.width}x${r.height}`)
  );
  const missingSizes = EXPORT_SIZES.filter(
    (s) => !generatedDimensions.has(`${s.width}x${s.height}`)
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDownload = async (url: string, width: number, height: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${projectName}-${width}x${height}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error("Download failed");
    }
  };

  const handleDownloadSelected = async () => {
    const selected = results.filter((r) => selectedIds.has(r.id));
    for (const r of selected) {
      await handleDownload(r.imageUrl, r.width, r.height);
    }
  };

  const handleGenerateMissing = () => {
    const overrides = Object.keys(editor.textOverrides).length > 0
      ? editor.textOverrides
      : undefined;
    batchMutation.mutate({
      projectId,
      sizeIds: missingSizes.map((s) => s.id),
      textOverrides: overrides,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Download Center</h3>
        {selectedIds.size > 0 && (
          <Button size="sm" variant="outline" onClick={handleDownloadSelected}>
            <Download className="mr-1 h-3.5 w-3.5" />
            Download {selectedIds.size} Selected
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {results.map((r) => {
          const sizeInfo = EXPORT_SIZES.find(
            (s) => s.width === r.width && s.height === r.height
          );
          return (
            <Card
              key={r.id}
              className={cn(
                "cursor-pointer transition-all",
                selectedIds.has(r.id) ? "ring-2 ring-violet-500" : ""
              )}
              onClick={() => toggleSelect(r.id)}
            >
              <CardContent className="p-2">
                <img
                  src={r.imageUrl}
                  alt={`${r.width}x${r.height}`}
                  className="mb-2 w-full rounded-md object-cover"
                  style={{ aspectRatio: `${r.width}/${r.height}`, maxHeight: 120 }}
                />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium">
                      {sizeInfo?.label ?? `${r.width}x${r.height}`}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {r.width}x{r.height}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(r.imageUrl, r.width, r.height);
                    }}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {missingSizes.length > 0 && (
        <Button
          variant="outline"
          className="w-full"
          onClick={handleGenerateMissing}
          disabled={batchMutation.isPending}
        >
          {batchMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating {missingSizes.length} sizes...
            </>
          ) : (
            <>
              <ImagePlus className="mr-2 h-4 w-4" />
              Generate {missingSizes.length} Missing Sizes
            </>
          )}
        </Button>
      )}
    </div>
  );
}
