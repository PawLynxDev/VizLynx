"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColorPicker } from "@/components/brand/ColorPicker";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { FONT_LIST } from "@/lib/fonts";

export default function NewBrandKitPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [colorPrimary, setColorPrimary] = useState("#6c63ff");
  const [colorSecondary, setColorSecondary] = useState("#1a1a2e");
  const [colorAccent, setColorAccent] = useState("#ff6b6b");
  const [colorBackground, setColorBackground] = useState("#ffffff");
  const [colorText, setColorText] = useState("#1a1a2e");
  const [fontHeading, setFontHeading] = useState("Inter");
  const [fontBody, setFontBody] = useState("Inter");

  const createMutation = trpc.brandKit.create.useMutation({
    onSuccess: (kit) => {
      toast.success("Brand kit created");
      router.push(`/brand-kits/${kit.id}`);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Please enter a name");
      return;
    }
    createMutation.mutate({
      name: name.trim(),
      colorPrimary,
      colorSecondary,
      colorAccent,
      colorBackground,
      colorText,
      fontHeading,
      fontBody,
    });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/brand-kits">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Create Brand Kit</h1>
      </div>

      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium">Brand Kit Name</label>
          <Input
            placeholder="e.g., My Brand"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
          />
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium">Colors</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <ColorPicker label="Primary" value={colorPrimary} onChange={setColorPrimary} />
            <ColorPicker label="Secondary" value={colorSecondary} onChange={setColorSecondary} />
            <ColorPicker label="Accent" value={colorAccent} onChange={setColorAccent} />
            <ColorPicker label="Background" value={colorBackground} onChange={setColorBackground} />
            <ColorPicker label="Text" value={colorText} onChange={setColorText} />
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium">Fonts</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Heading Font</label>
              <select
                value={fontHeading}
                onChange={(e) => setFontHeading(e.target.value)}
                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm"
              >
                {FONT_LIST.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Body Font</label>
              <select
                value={fontBody}
                onChange={(e) => setFontBody(e.target.value)}
                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm"
              >
                {FONT_LIST.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <Button
          onClick={handleCreate}
          disabled={!name.trim() || createMutation.isPending}
          className="w-full"
          size="lg"
        >
          {createMutation.isPending ? "Creating..." : "Create Brand Kit"}
        </Button>
      </div>
    </div>
  );
}
