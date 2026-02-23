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
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/brand-kits">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Brand Kit</h1>
            <p className="mt-1 text-gray-600">Define your brand identity</p>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="space-y-8">
            <div>
              <label className="mb-3 block text-sm font-semibold text-gray-900">Brand Kit Name</label>
              <Input
                placeholder="e.g., My Brand"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                className="rounded-xl border-gray-200 text-base"
              />
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold text-gray-900">Colors</h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <ColorPicker label="Primary" value={colorPrimary} onChange={setColorPrimary} />
                <ColorPicker label="Secondary" value={colorSecondary} onChange={setColorSecondary} />
                <ColorPicker label="Accent" value={colorAccent} onChange={setColorAccent} />
                <ColorPicker label="Background" value={colorBackground} onChange={setColorBackground} />
                <ColorPicker label="Text" value={colorText} onChange={setColorText} />
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold text-gray-900">Fonts</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Heading Font</label>
                  <select
                    value={fontHeading}
                    onChange={(e) => setFontHeading(e.target.value)}
                    className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    {FONT_LIST.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Body Font</label>
                  <select
                    value={fontBody}
                    onChange={(e) => setFontBody(e.target.value)}
                    className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
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
              className="h-12 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-base font-semibold shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
            >
              {createMutation.isPending ? "Creating..." : "Create Brand Kit"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
