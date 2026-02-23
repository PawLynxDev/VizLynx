"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  finalImageUrl: string;
}

export function TextOverlayEditor({ finalImageUrl }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Final Image with Text</CardTitle>
      </CardHeader>
      <CardContent>
        <img
          src={finalImageUrl}
          alt="Final with text"
          className="w-full rounded-lg object-contain"
          style={{ maxHeight: 500 }}
        />
      </CardContent>
    </Card>
  );
}
