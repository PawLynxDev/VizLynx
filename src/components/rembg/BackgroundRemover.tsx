"use client";

import { useState, useCallback } from "react";
import { Upload, Download, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

type Status = "idle" | "uploading" | "processing" | "done" | "error";

export function BackgroundRemover() {
  const [status, setStatus] = useState<Status>("idle");
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(async (file: File) => {
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
  }, []);

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

  const handleReset = () => {
    setStatus("idle");
    setOriginalUrl(null);
    setProcessedUrl(null);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Remove Background</h1>
        <p className="text-muted-foreground mt-1">
          Upload an image to automatically remove its background
        </p>
      </div>

      {status === "idle" && (
        <Card>
          <CardContent>
            <label
              className={`flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                dragOver ? "border-violet-500 bg-violet-50" : "border-gray-300 hover:border-gray-400"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
            >
              <Upload className="mb-4 h-10 w-10 text-gray-400" />
              <span className="text-sm font-medium text-gray-600">
                Drop an image here or click to upload
              </span>
              <span className="mt-1 text-xs text-gray-400">JPEG, PNG, or WebP up to 10MB</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={onFileInput}
              />
            </label>
          </CardContent>
        </Card>
      )}

      {status === "processing" && (
        <Card>
          <CardContent>
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
              <p className="text-sm text-gray-600">Removing background...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {(status === "done" || status === "error") && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Original</CardTitle>
              </CardHeader>
              <CardContent>
                {originalUrl && (
                  <img
                    src={originalUrl}
                    alt="Original"
                    className="w-full rounded-lg object-contain"
                    style={{ maxHeight: 400 }}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Background Removed</CardTitle>
              </CardHeader>
              <CardContent>
                {processedUrl ? (
                  <div className="rounded-lg bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZTVlN2ViIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNlNWU3ZWIiLz48L3N2Zz4=')]">
                    <img
                      src={processedUrl}
                      alt="Processed"
                      className="w-full rounded-lg object-contain"
                      style={{ maxHeight: 400 }}
                    />
                  </div>
                ) : (
                  <div className="flex min-h-[200px] items-center justify-center">
                    <ImageIcon className="h-10 w-10 text-gray-300" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-3">
            {processedUrl && (
              <Button asChild>
                <a href={processedUrl} download="background-removed.png">
                  <Download className="mr-2 h-4 w-4" />
                  Download PNG
                </a>
              </Button>
            )}
            <Button variant="outline" onClick={handleReset}>
              Upload Another
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
