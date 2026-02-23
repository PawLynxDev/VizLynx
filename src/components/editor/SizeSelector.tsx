"use client";

import { cn } from "@/lib/utils";
import { useEditorStore } from "@/stores/editorStore";
import { EXPORT_SIZES } from "@/types";

export function SizeSelector() {
  const { selectedSizeId, setSelectedSizeId } = useEditorStore();

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Export Size</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {EXPORT_SIZES.map((size) => (
          <button
            key={size.id}
            onClick={() => setSelectedSizeId(size.id)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg border p-3 text-center transition-all",
              selectedSizeId === size.id
                ? "border-violet-500 bg-violet-50 text-violet-700"
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            <SizePreview width={size.width} height={size.height} active={selectedSizeId === size.id} />
            <span className="text-xs font-medium">{size.label}</span>
            <span className="text-[10px] text-gray-400">
              {size.width}x{size.height}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function SizePreview({
  width,
  height,
  active,
}: {
  width: number;
  height: number;
  active: boolean;
}) {
  const maxDim = 32;
  const scale = maxDim / Math.max(width, height);
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);

  return (
    <div
      className={cn(
        "rounded-sm border",
        active ? "border-violet-400 bg-violet-200" : "border-gray-300 bg-gray-100"
      )}
      style={{ width: w, height: h }}
    />
  );
}
