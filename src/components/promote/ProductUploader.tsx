"use client";

import { useCallback, useState } from "react";
import { Upload, Loader2, ImageIcon } from "lucide-react";
import { usePromotionStore } from "@/stores/promotionStore";
import { toast } from "sonner";
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <label
        className={`group relative flex min-h-[500px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300 ${
          dragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        {uploading ? (
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
            <p className="text-sm font-medium text-gray-900">Uploading...</p>
            <p className="mt-1 text-xs text-gray-500">{uploadProgress}%</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="mx-auto mb-6 inline-flex rounded-full bg-gradient-to-br from-blue-100 to-purple-100 p-6">
              <Upload className="h-12 w-12 text-blue-600" />
            </div>

            <h3 className="mb-2 text-2xl font-bold text-gray-900">
              {dragOver ? "Drop your image here" : "Upload Product Photo"}
            </h3>
            <p className="mb-6 text-gray-600">
              Drag and drop or click to select a product image
            </p>

            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 shadow-sm">
              <ImageIcon className="h-4 w-4" />
              PNG, JPG, WEBP up to 10MB
            </div>
          </div>
        )}

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={onFileInput}
          disabled={uploading}
        />
      </label>
    </motion.div>
  );
}
