"use client";

import { ImageIcon } from "lucide-react";

interface ImagePreviewProps {
  src: string | null | undefined;
  label: string;
  className?: string;
}

export function ImagePreview({ src, label, className }: ImagePreviewProps) {
  return (
    <div className={className}>
      <p className="mb-2 text-sm font-medium text-gray-600">{label}</p>
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-gray-100">
        {src ? (
          <img
            src={src}
            alt={label}
            className="h-full w-full object-contain"
          />
        ) : (
          <ImageIcon className="h-16 w-16 text-gray-300" />
        )}
      </div>
    </div>
  );
}
