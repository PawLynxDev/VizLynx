"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Video } from "lucide-react";

interface Props {
  videoUrl: string | null;
  videoStatus: "idle" | "loading" | "done" | "error";
  onGenerate: () => void;
}

export function VideoGenerator({ videoUrl, videoStatus, onGenerate }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Promo Video</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {videoUrl && videoStatus === "done" ? (
          <video
            src={videoUrl}
            controls
            className="w-full rounded-lg"
            style={{ maxHeight: 400 }}
          />
        ) : (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-lg bg-gray-50">
            {videoStatus === "loading" ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
                <p className="text-sm text-gray-600">Generating video... This may take 1-3 minutes.</p>
              </>
            ) : (
              <>
                <Video className="h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-500">Generate a short promo video from your image</p>
              </>
            )}
          </div>
        )}

        {videoStatus !== "loading" && (
          <Button onClick={onGenerate} variant={videoUrl ? "outline" : "default"}>
            <Video className="mr-2 h-4 w-4" />
            {videoUrl ? "Regenerate Video" : "Generate Promo Video"}
          </Button>
        )}

        {videoStatus === "error" && (
          <p className="text-sm text-red-600">Video generation failed. Please try again.</p>
        )}
      </CardContent>
    </Card>
  );
}
