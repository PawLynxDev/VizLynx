"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useProjectStore } from "@/stores/projectStore";

const ACCEPTED = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};
const MAX_SIZE = 10 * 1024 * 1024;

export function ImageUploader({ projectId }: { projectId: string }) {
  const [uploading, setUploading] = useState(false);
  const store = useProjectStore();
  const utils = trpc.useUtils();

  const confirmUpload = trpc.upload.confirmUpload.useMutation();
  const triggerBgRemoval = trpc.upload.triggerBackgroundRemoval.useMutation({
    onSuccess: (data) => {
      if (data.processedUrl) {
        store.setProcessedImage(data.processedUrl);
        toast.success("Background removed");
      }
      utils.project.getById.invalidate({ id: projectId });
    },
    onError: (err) => {
      store.setBgRemovalStatus("error");
      toast.error(`Background removal failed: ${err.message}`);
    },
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setUploading(true);
      store.setUploadProgress(0);

      try {
        // Upload file through the server
        store.setUploadProgress(10);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("projectId", projectId);

        const res = await fetch("/api/upload/presign", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Upload failed");
        }

        const { fileKey, publicUrl, fileName, fileSize, mimeType } =
          await res.json();
        store.setUploadProgress(70);

        // Confirm upload in DB
        const sourceImage = await confirmUpload.mutateAsync({
          projectId,
          fileKey,
          publicUrl,
          fileName,
          fileSize,
          mimeType,
        });
        store.setUploadProgress(100);
        store.setSourceImage(sourceImage.id, publicUrl);
        toast.success("Image uploaded");

        // Trigger background removal
        store.setBgRemovalStatus("processing");
        triggerBgRemoval.mutate({
          sourceImageId: sourceImage.id,
          projectId,
        });
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Upload failed"
        );
      } finally {
        setUploading(false);
      }
    },
    [projectId, confirmUpload, triggerBgRemoval, store, utils]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxSize: MAX_SIZE,
    multiple: false,
    disabled: uploading || store.bgRemovalStatus === "processing",
    onDropRejected: (rejections) => {
      const err = rejections[0]?.errors[0];
      if (err?.code === "file-too-large") {
        toast.error("File too large. Maximum size is 10MB.");
      } else if (err?.code === "file-invalid-type") {
        toast.error("Invalid file type. Only JPEG, PNG, and WebP are allowed.");
      }
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors ${
        isDragActive
          ? "border-violet-500 bg-violet-50"
          : "border-gray-300 bg-white hover:border-violet-400 hover:bg-gray-50"
      } ${uploading ? "pointer-events-none opacity-60" : ""}`}
    >
      <input {...getInputProps()} />
      {uploading || store.bgRemovalStatus === "processing" ? (
        <>
          <Loader2 className="mb-4 h-12 w-12 animate-spin text-violet-500" />
          <p className="text-sm font-medium text-gray-700">
            {store.bgRemovalStatus === "processing"
              ? "Removing background..."
              : "Uploading..."}
          </p>
          {uploading && (
            <div className="mt-3 h-2 w-48 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-violet-500 transition-all"
                style={{ width: `${store.uploadProgress}%` }}
              />
            </div>
          )}
        </>
      ) : (
        <>
          <Upload className="mb-4 h-12 w-12 text-gray-400" />
          <p className="mb-1 text-sm font-medium text-gray-700">
            {isDragActive ? "Drop your image here" : "Drag & drop your product photo"}
          </p>
          <p className="text-xs text-gray-500">
            JPEG, PNG or WebP, max 10MB
          </p>
        </>
      )}
    </div>
  );
}
