"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ColorPicker } from "@/components/brand/ColorPicker";
import { LogoUploader } from "@/components/brand/LogoUploader";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { FONT_LIST } from "@/lib/fonts";

export default function EditBrandKitPage() {
  const params = useParams();
  const router = useRouter();
  const brandKitId = params.id as string;
  const utils = trpc.useUtils();

  const { data: kit, isLoading } = trpc.brandKit.getById.useQuery(
    { id: brandKitId },
    { enabled: !!brandKitId }
  );

  const [name, setName] = useState("");
  const [colorPrimary, setColorPrimary] = useState("#6c63ff");
  const [colorSecondary, setColorSecondary] = useState("#1a1a2e");
  const [colorAccent, setColorAccent] = useState("#ff6b6b");
  const [colorBackground, setColorBackground] = useState("#ffffff");
  const [colorText, setColorText] = useState("#1a1a2e");
  const [fontHeading, setFontHeading] = useState("Inter");
  const [fontBody, setFontBody] = useState("Inter");
  const [logoLightUrl, setLogoLightUrl] = useState<string | null>(null);
  const [logoLightKey, setLogoLightKey] = useState<string | null>(null);
  const [logoDarkUrl, setLogoDarkUrl] = useState<string | null>(null);
  const [logoDarkKey, setLogoDarkKey] = useState<string | null>(null);

  useEffect(() => {
    if (kit) {
      setName(kit.name);
      setColorPrimary(kit.colorPrimary);
      setColorSecondary(kit.colorSecondary);
      setColorAccent(kit.colorAccent);
      setColorBackground(kit.colorBackground);
      setColorText(kit.colorText);
      setFontHeading(kit.fontHeading);
      setFontBody(kit.fontBody);
      setLogoLightUrl(kit.logoLightUrl);
      setLogoLightKey(kit.logoLightKey);
      setLogoDarkUrl(kit.logoDarkUrl);
      setLogoDarkKey(kit.logoDarkKey);
    }
  }, [kit]);

  const updateMutation = trpc.brandKit.update.useMutation({
    onSuccess: () => {
      toast.success("Brand kit updated");
      utils.brandKit.getById.invalidate({ id: brandKitId });
      utils.brandKit.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.brandKit.delete.useMutation({
    onSuccess: () => {
      toast.success("Brand kit deleted");
      router.push("/brand-kits");
    },
    onError: (err) => toast.error(err.message),
  });

  const setDefaultMutation = trpc.brandKit.setDefault.useMutation({
    onSuccess: () => {
      toast.success("Set as default brand kit");
      utils.brandKit.getById.invalidate({ id: brandKitId });
      utils.brandKit.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSave = () => {
    updateMutation.mutate({
      id: brandKitId,
      name: name.trim(),
      colorPrimary,
      colorSecondary,
      colorAccent,
      colorBackground,
      colorText,
      fontHeading,
      fontBody,
      logoLightUrl,
      logoLightKey,
      logoDarkUrl,
      logoDarkKey,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <Skeleton className="h-12 w-64 rounded-xl" />
          <Skeleton className="h-[600px] w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!kit) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <p className="text-lg text-gray-500">Brand kit not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/brand-kits">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Brand Kit</h1>
              <p className="mt-1 text-gray-600">Update your brand identity</p>
            </div>
          </div>
          <div className="flex gap-2">
            {!kit.isDefault && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDefaultMutation.mutate({ id: brandKitId })}
                disabled={setDefaultMutation.isPending}
                className="rounded-xl"
              >
                <Star className="mr-1.5 h-4 w-4" />
                Set Default
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm("Delete this brand kit?")) {
                  deleteMutation.mutate({ id: brandKitId });
                }
              }}
              disabled={deleteMutation.isPending}
              className="rounded-xl"
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="space-y-8">
            <div>
              <label className="mb-3 block text-sm font-semibold text-gray-900">Brand Kit Name</label>
              <Input
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

            <div>
              <h3 className="mb-4 text-sm font-semibold text-gray-900">Logos</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <LogoUploader
                  label="Light Logo (for dark backgrounds)"
                  currentUrl={logoLightUrl}
                  brandKitId={brandKitId}
                  variant="light"
                  onUploaded={(url, key) => {
                    setLogoLightUrl(url);
                    setLogoLightKey(key);
                  }}
                  onRemoved={() => {
                    setLogoLightUrl(null);
                    setLogoLightKey(null);
                  }}
                />
                <LogoUploader
                  label="Dark Logo (for light backgrounds)"
                  currentUrl={logoDarkUrl}
                  brandKitId={brandKitId}
                  variant="dark"
                  onUploaded={(url, key) => {
                    setLogoDarkUrl(url);
                    setLogoDarkKey(key);
                  }}
                  onRemoved={() => {
                    setLogoDarkUrl(null);
                    setLogoDarkKey(null);
                  }}
                />
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={!name.trim() || updateMutation.isPending}
              className="h-12 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-base font-semibold shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
