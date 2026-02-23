"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Loader2, Sparkles, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageUploader } from "@/components/upload/ImageUploader";
import { ImagePreview } from "@/components/editor/ImagePreview";
import { TextEditor } from "@/components/editor/TextEditor";
import { CopyGenerator } from "@/components/editor/CopyGenerator";
import { SizeSelector } from "@/components/editor/SizeSelector";
import { DownloadCenter } from "@/components/editor/DownloadCenter";
import { trpc } from "@/lib/trpc";
import { useProjectStore } from "@/stores/projectStore";
import { useEditorStore } from "@/stores/editorStore";
import { toast } from "sonner";
import type { TemplateConfig } from "@/types";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const store = useProjectStore();
  const editor = useEditorStore();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: project, isLoading } = trpc.project.getById.useQuery(
    { id: projectId },
    { enabled: !!projectId }
  ) as { data: any; isLoading: boolean };

  const { data: brandKits } = trpc.brandKit.list.useQuery();

  const generateMutation = trpc.generation.generate.useMutation({
    onSuccess: (data) => {
      store.setGeneratedImage(data.imageUrl);
      toast.success("Image generated");
      utils.project.getById.invalidate({ id: projectId });
      utils.generation.getResults.invalidate({ projectId });
    },
    onError: (err) => {
      store.setGenerationStatus("error");
      toast.error(`Generation failed: ${err.message}`);
    },
  });

  const updateBrandKitMutation = trpc.project.updateBrandKit.useMutation({
    onSuccess: () => {
      toast.success("Brand kit updated");
      utils.project.getById.invalidate({ id: projectId });
    },
    onError: (err) => toast.error(err.message),
  });

  const utils = trpc.useUtils();

  useEffect(() => {
    if (project) {
      const si = project.sourceImages[0];
      const gc = project.generatedContent[0];
      if (si) {
        store.setSourceImage(si.id, si.originalUrl);
        if (si.processedUrl) store.setProcessedImage(si.processedUrl);
        if (si.status === "processing") store.setBgRemovalStatus("processing");
      }
      if (gc) store.setGeneratedImage(gc.imageUrl);
    }
    return () => {
      store.reset();
      editor.reset();
    };
  }, [project]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-500">Project not found</p>
      </div>
    );
  }

  const sourceImage = project.sourceImages[0];
  const generatedContent = project.generatedContent[0];
  const hasSourceImage = !!sourceImage;
  const hasProcessedImage = !!sourceImage?.processedUrl;
  const hasGenerated = !!generatedContent;
  const templateConfig = project.template.config as unknown as TemplateConfig;

  const handleGenerate = () => {
    store.setGenerationStatus("processing");
    const overrides = Object.keys(editor.textOverrides).length > 0
      ? editor.textOverrides
      : undefined;
    generateMutation.mutate({
      projectId,
      sizeId: editor.selectedSizeId !== "square" ? editor.selectedSizeId : undefined,
      textOverrides: overrides,
    });
  };

  const handleDownload = async () => {
    if (!generatedContent) return;
    try {
      const response = await fetch(generatedContent.imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.name}-pixelforge.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Download failed");
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/projects">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">{project.template.name}</Badge>
              <Badge variant="outline">{project.status}</Badge>
              {project.brandKit && (
                <Badge variant="secondary" className="gap-1">
                  <Palette className="h-3 w-3" />
                  {project.brandKit.name}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {!hasSourceImage && <ImageUploader projectId={projectId} />}

      {hasSourceImage && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main content area */}
          <div className="lg:col-span-2 space-y-6">
            {!hasGenerated && (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <ImagePreview
                    src={sourceImage.originalUrl}
                    label="Original Photo"
                  />
                  <ImagePreview
                    src={sourceImage.processedUrl ?? store.processedImageUrl}
                    label={
                      store.bgRemovalStatus === "processing"
                        ? "Removing background..."
                        : "Background Removed"
                    }
                  />
                </div>

                {store.bgRemovalStatus === "processing" && (
                  <div className="flex items-center justify-center gap-2 py-4 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Removing background... This may take a moment.
                  </div>
                )}
              </>
            )}

            {hasGenerated && (
              <>
                <div className="overflow-hidden rounded-xl border bg-white">
                  <img
                    src={generatedContent.imageUrl}
                    alt="Generated marketing image"
                    className="w-full"
                  />
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleDownload} size="lg" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Download PNG
                  </Button>
                  <Button
                    onClick={handleGenerate}
                    variant="outline"
                    size="lg"
                    disabled={generateMutation.isPending}
                  >
                    {generateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <ImagePreview
                    src={sourceImage.originalUrl}
                    label="Original Photo"
                  />
                  <ImagePreview
                    src={sourceImage.processedUrl}
                    label="Background Removed"
                  />
                </div>

                <DownloadCenter projectId={projectId} projectName={project.name} />
              </>
            )}
          </div>

          {/* Customization sidebar */}
          <div className="space-y-6">
            {/* Brand kit selector */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Brand Kit</h3>
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-gray-400" />
                <select
                  value={project.brandKitId ?? ""}
                  onChange={(e) =>
                    updateBrandKitMutation.mutate({
                      id: projectId,
                      brandKitId: e.target.value || null,
                    })
                  }
                  className="h-9 flex-1 rounded-lg border border-gray-200 px-3 text-sm"
                >
                  <option value="">No brand kit</option>
                  {brandKits?.map((kit) => (
                    <option key={kit.id} value={kit.id}>
                      {kit.name}{kit.isDefault ? " (default)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <TextEditor textOverlays={templateConfig.textOverlays} />

            <CopyGenerator projectId={projectId} />

            <SizeSelector />

            {hasProcessedImage && (
              <Button
                onClick={handleGenerate}
                disabled={
                  generateMutation.isPending ||
                  store.generationStatus === "processing"
                }
                className="w-full"
                size="lg"
              >
                {generateMutation.isPending ||
                store.generationStatus === "processing" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Image
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
