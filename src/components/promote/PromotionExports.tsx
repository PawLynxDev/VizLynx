"use client";

import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { EXPORT_SIZES } from "@/types";
import { usePromotionStore } from "@/stores/promotionStore";

interface ExportItem {
  id: string;
  imageUrl: string;
  width: number;
  height: number;
  sizeLabel: string;
}

interface Props {
  exports: ExportItem[];
  onExport: (sizeIds: string[]) => void;
  exporting: boolean;
}

export function PromotionExports({ exports: exportItems, onExport, exporting }: Props) {
  const { selectedSizeIds, setSelectedSizeIds } = usePromotionStore();

  const toggleSize = (id: string) => {
    setSelectedSizeIds(
      selectedSizeIds.includes(id)
        ? selectedSizeIds.filter((s) => s !== id)
        : [...selectedSizeIds, id]
    );
  };

  const selectAll = () => {
    setSelectedSizeIds(EXPORT_SIZES.map((s) => s.id));
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {EXPORT_SIZES.map((size) => (
          <button
            key={size.id}
            onClick={() => toggleSize(size.id)}
            className={`rounded-xl border-2 p-4 text-left transition-all duration-200 ${
              selectedSizeIds.includes(size.id)
                ? "border-blue-500 bg-blue-50 shadow-sm"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <span className="block text-sm font-semibold text-gray-900">{size.label}</span>
            <span className="mt-1 block text-xs text-gray-500">
              {size.width} x {size.height} ({size.aspect})
            </span>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => onExport(selectedSizeIds)}
          disabled={exporting || selectedSizeIds.length === 0}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600"
        >
          {exporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            `Export ${selectedSizeIds.length} Size${selectedSizeIds.length !== 1 ? "s" : ""}`
          )}
        </Button>
        <Button variant="outline" onClick={selectAll} className="rounded-xl">
          Select All
        </Button>
      </div>

      {exportItems.length > 0 && (
        <div className="space-y-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">Downloads</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {exportItems.map((item) => (
              <a
                key={item.id}
                href={item.imageUrl}
                download={`promotion-${item.sizeLabel.toLowerCase().replace(/\s+/g, "-")}.png`}
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-3 text-sm transition-colors hover:bg-gray-50"
              >
                <Download className="h-4 w-4 text-blue-600" />
                <div>
                  <span className="font-medium text-gray-900">{item.sizeLabel}</span>
                  <span className="ml-1 text-xs text-gray-500">
                    {item.width}x{item.height}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
