"use client";

import { useState, useCallback } from "react";
import { Upload, Download, Loader2, ImageIcon, X, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";

type Status = "idle" | "uploading" | "processing" | "done" | "error";

export function BackgroundRemover() {
  const { requireAuth } = useAuthRedirect();
  const [status, setStatus] = useState<Status>("idle");
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    // Check authentication before processing
    if (!requireAuth()) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setStatus("uploading");
    setOriginalUrl(URL.createObjectURL(file));
    setProcessedUrl(null);

    try {
      setStatus("processing");
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/rembg", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Upload failed");
      }

      const data = await res.json();
      setProcessedUrl(data.processedUrl);
      setStatus("done");
      toast.success("Background removed successfully!");
    } catch (err) {
      setStatus("error");
      toast.error(err instanceof Error ? err.message : "Failed to remove background");
    }
  }, [requireAuth]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 1,
    disabled: status === "processing",
  });

  const handleReset = () => {
    setStatus("idle");
    setOriginalUrl(null);
    setProcessedUrl(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto flex-1 px-4 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Upload Area / Preview Area */}
          {status === "idle" ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div
                {...getRootProps()}
                className={`group relative flex min-h-[500px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300 ${
                  isDragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <input {...getInputProps()} />

                <div className="text-center">
                  <div className="mx-auto mb-6 inline-flex rounded-full bg-gradient-to-br from-blue-100 to-purple-100 p-6">
                    <Scissors className="h-12 w-12 text-blue-600" />
                  </div>

                  <h3 className="mb-2 text-2xl font-bold text-gray-900">
                    {isDragActive ? "Drop your image here" : "Upload Image"}
                  </h3>
                  <p className="mb-6 text-gray-600">
                    Drag and drop or click to select an image
                  </p>

                  <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 shadow-sm">
                    <ImageIcon className="h-4 w-4" />
                    PNG, JPG, WEBP up to 10MB
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              {/* Image Preview with Results */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Original Image */}
                <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Original</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleReset}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="overflow-hidden rounded-2xl bg-gray-50">
                    {originalUrl && (
                      <img
                        src={originalUrl}
                        alt="Original"
                        className="w-full object-contain"
                        style={{ maxHeight: "400px" }}
                      />
                    )}
                  </div>
                </div>

                {/* Processed Image */}
                <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900">Background Removed</h3>
                  </div>

                  {status === "processing" ? (
                    <div className="flex h-[400px] items-center justify-center rounded-2xl bg-gray-50">
                      <div className="text-center">
                        <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
                        <p className="text-sm text-gray-600">Removing background...</p>
                      </div>
                    </div>
                  ) : processedUrl ? (
                    <div className="overflow-hidden rounded-2xl bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZTVlN2ViIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNlNWU3ZWIiLz48L3N2Zz4=')]">
                      <img
                        src={processedUrl}
                        alt="Processed"
                        className="w-full object-contain"
                        style={{ maxHeight: "400px" }}
                      />
                    </div>
                  ) : (
                    <div className="flex h-[400px] items-center justify-center rounded-2xl bg-gray-50">
                      <div className="text-center">
                        <ImageIcon className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                        <p className="text-sm text-gray-500">Processing...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom Fixed Panel - Actions */}
      {status !== "idle" && (
        <div className="sticky bottom-0 left-0 right-0 border-t border-gray-200 bg-white/80 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="mx-auto max-w-7xl">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {status === "processing" && "Processing your image..."}
                  {status === "done" && "Background removed successfully!"}
                  {status === "error" && "An error occurred"}
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="rounded-2xl"
                  >
                    Upload Another
                  </Button>

                  {processedUrl && (
                    <Button
                      asChild
                      className="h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 font-semibold shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
                    >
                      <a href={processedUrl} download="background-removed.png">
                        <Download className="mr-2 h-5 w-5" />
                        Download PNG
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
