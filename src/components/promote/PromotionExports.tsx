"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Export Sizes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {EXPORT_SIZES.map((size) => (
            <button
              key={size.id}
              onClick={() => toggleSize(size.id)}
              className={`rounded-lg border p-3 text-left transition-colors ${
                selectedSizeIds.includes(size.id)
                  ? "border-violet-500 bg-violet-50"
                  : "hover:border-gray-400"
              }`}
            >
              <span className="text-sm font-medium">{size.label}</span>
              <span className="mt-0.5 block text-xs text-gray-500">
                {size.width} x {size.height} ({size.aspect})
              </span>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <Button onClick={() => onExport(selectedSizeIds)} disabled={exporting || selectedSizeIds.length === 0}>
            {exporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              `Export ${selectedSizeIds.length} Size${selectedSizeIds.length !== 1 ? "s" : ""}`
            )}
          </Button>
          <Button variant="outline" onClick={selectAll}>
            Select All
          </Button>
        </div>

        {exportItems.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500">Downloads</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {exportItems.map((item) => (
                <a
                  key={item.id}
                  href={item.imageUrl}
                  download={`promotion-${item.sizeLabel.toLowerCase().replace(/\s+/g, "-")}.png`}
                  className="flex items-center gap-2 rounded-lg border p-2 text-sm hover:bg-gray-50"
                >
                  <Download className="h-4 w-4 text-violet-600" />
                  <div>
                    <span className="font-medium">{item.sizeLabel}</span>
                    <span className="ml-1 text-xs text-gray-500">
                      {item.width}x{item.height}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
