"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LogoUploaderProps {
  label: string;
  currentUrl: string | null;
  brandKitId: string;
  variant: "light" | "dark";
  onUploaded: (url: string, key: string) => void;
  onRemoved: () => void;
}

export function LogoUploader({
  label,
  currentUrl,
  brandKitId,
  variant,
  onUploaded,
  onRemoved,
}: LogoUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("brandKitId", brandKitId);
        formData.append("variant", variant);

        const res = await fetch("/api/upload/brand-logo", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Upload failed");
        }

        const data = await res.json();
        onUploaded(data.publicUrl, data.fileKey);
        toast.success("Logo uploaded");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [brandKitId, variant, onUploaded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
      "image/svg+xml": [".svg"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  if (currentUrl) {
    return (
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="relative inline-block rounded-lg border border-gray-200 p-2">
          <img
            src={currentUrl}
            alt={label}
            className="h-16 w-auto max-w-[200px] object-contain"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
            onClick={onRemoved}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div
        {...getRootProps()}
        className={`flex h-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
          isDragActive
            ? "border-violet-400 bg-violet-50"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        ) : (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Upload className="h-4 w-4" />
            Drop logo or click to upload
          </div>
        )}
      </div>
    </div>
  );
}
