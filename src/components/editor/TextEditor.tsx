"use client";

import { Input } from "@/components/ui/input";
import { useEditorStore } from "@/stores/editorStore";
import type { TextOverlay } from "@/types";

interface TextEditorProps {
  textOverlays: TextOverlay[];
}

export function TextEditor({ textOverlays }: TextEditorProps) {
  const { textOverrides, setTextOverride } = useEditorStore();

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Text Content</h3>
      {textOverlays.map((overlay, i) => (
        <div key={i}>
          <label className="mb-1 block text-xs text-gray-500">
            Text {i + 1} ({overlay.weight} {overlay.size}px)
          </label>
          <Input
            value={textOverrides[String(i)] ?? overlay.text}
            onChange={(e) => setTextOverride(i, e.target.value)}
            placeholder={overlay.text}
          />
        </div>
      ))}
    </div>
  );
}
