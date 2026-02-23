"use client";

import { useCallback, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { usePromotionStore } from "@/stores/promotionStore";
import { toast } from "sonner";

interface Props {
  onUploaded: (data: {
    fileKey: string;
    publicUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }) => void;
}

export function ProductUploader({ onUploaded }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const { uploadProgress, setUploadProgress } = usePromotionStore();
  const [uploading, setUploading] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      setUploading(true);
      setUploadProgress(10);

      try {
        const formData = new FormData();
        formData.append("file", file);

        setUploadProgress(30);
        const res = await fetch("/api/upload/promotion", { method: "POST", body: formData });
        setUploadProgress(80);

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Upload failed");
        }

        const data = await res.json();
        setUploadProgress(100);
        onUploaded(data);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [onUploaded, setUploadProgress]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <Card>
      <CardContent>
        <label
          className={`flex min-h-[250px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
            dragOver ? "border-violet-500 bg-violet-50" : "border-gray-300 hover:border-gray-400"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
              <span className="text-sm text-gray-600">Uploading... {uploadProgress}%</span>
            </div>
          ) : (
            <>
              <Upload className="mb-4 h-10 w-10 text-gray-400" />
              <span className="text-sm font-medium text-gray-600">
                Drop your product photo here or click to upload
              </span>
              <span className="mt-1 text-xs text-gray-400">JPEG, PNG, or WebP up to 10MB</span>
            </>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={onFileInput}
            disabled={uploading}
          />
        </label>
      </CardContent>
    </Card>
  );
}
