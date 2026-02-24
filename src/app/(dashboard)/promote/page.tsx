"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { usePromotionStore } from "@/stores/promotionStore";
import { toast } from "sonner";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { AnimatePresence } from "framer-motion";

// New components
import { ProductUploader } from "@/components/promote/ProductUploader";
import { ImagePreviewTabs } from "@/components/promote/ImagePreviewTabs";
import { MarketingCopyPanel } from "@/components/promote/MarketingCopyPanel";
import { PromptBottomPanel } from "@/components/promote/PromptBottomPanel";
import { ExpandableSection } from "@/components/promote/ExpandableSection";
import { VideoGenerator } from "@/components/promote/VideoGenerator";
import { PromotionExports } from "@/components/promote/PromotionExports";

export default function PromotePage() {
  const { requireAuth } = useAuthRedirect();
  const store = usePromotionStore();
  const [selectedBrandKitId, setSelectedBrandKitId] = useState<string | undefined>();
  const [exportItems, setExportItems] = useState<
    Array<{ id: string; imageUrl: string; width: number; height: number; sizeLabel: string }>
  >([]);

  // Brand kits query
  const brandKitsQuery = trpc.brandKit.list.useQuery(undefined, {
    staleTime: 60_000,
  });

  // Mutations
  const createPromotion = trpc.promotion.create.useMutation({
    onSuccess: (data) => {
      store.setPromotionId(data.id);
      if (data.fluxPrompt) {
        store.setAnalysis({
          fluxPrompt: data.fluxPrompt,
          headline: data.marketingHeadline ?? "",
          subline: data.marketingSubline ?? "",
          cta: data.marketingCta ?? "",
        });
      }
      store.setAnalysisStatus("done");
    },
    onError: (err) => {
      store.setAnalysisStatus("error");
      toast.error(err.message);
    },
  });

  const reanalyze = trpc.promotion.analyze.useMutation({
    onSuccess: (data) => {
      if (data.fluxPrompt) {
        store.setAnalysis({
          fluxPrompt: data.fluxPrompt,
          headline: data.marketingHeadline ?? "",
          subline: data.marketingSubline ?? "",
          cta: data.marketingCta ?? "",
        });
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const generateImage = trpc.promotion.generateImage.useMutation({
    onSuccess: (data) => {
      if (data.fluxImageUrl) {
        store.setFluxImage(data.fluxImageUrl);
      }
    },
    onError: (err) => {
      store.setImageGenerationStatus("error");
      toast.error(err.message);
    },
  });

  const generateVideo = trpc.promotion.generateVideo.useMutation({
    onSuccess: (data) => {
      if (data.videoUrl) {
        store.setVideoUrl(data.videoUrl);
      }
    },
    onError: (err) => {
      store.setVideoStatus("error");
      toast.error(err.message);
    },
  });

  const exportSizes = trpc.promotion.exportSizes.useMutation({
    onSuccess: (data) => {
      setExportItems(data);
      toast.success(`Exported ${data.length} sizes`);
    },
    onError: (err) => toast.error(err.message),
  });

  // Handlers
  const handleUploaded = (data: {
    fileKey: string;
    publicUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }) => {
    if (!requireAuth()) return;

    store.setSourceImage(data.publicUrl);
    store.setAnalysisStatus("loading");

    createPromotion.mutate({
      sourceImageUrl: data.publicUrl,
      sourceImageKey: data.fileKey,
      sourceFileName: data.fileName,
      sourceFileSize: data.fileSize,
      sourceMimeType: data.mimeType,
      brandKitId: selectedBrandKitId,
    });
  };

  const handleGenerate = () => {
    if (!requireAuth()) return;
    if (!store.promotionId) return;
    store.setImageGenerationStatus("loading");

    generateImage.mutate({
      id: store.promotionId,
      prompt: store.editedFluxPrompt,
    });
  };

  const handleReanalyze = (tone: string) => {
    if (!requireAuth()) return;
    if (!store.promotionId) return;
    reanalyze.mutate({
      id: store.promotionId,
      tone,
      brandKitId: selectedBrandKitId,
    });
  };

  const handleGenerateVideo = () => {
    if (!requireAuth()) return;
    if (!store.promotionId) return;
    store.setVideoStatus("loading");

    generateVideo.mutate({
      id: store.promotionId,
    });
  };

  const handleExport = (sizeIds: string[]) => {
    if (!requireAuth()) return;
    if (!store.promotionId || sizeIds.length === 0) return;
    exportSizes.mutate({
      id: store.promotionId,
      sizeIds,
    });
  };

  const handleReset = () => {
    store.reset();
    setExportItems([]);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto flex-1 px-4 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Upload State - Full screen upload area */}
          {!store.sourceImageUrl && <ProductUploader onUploaded={handleUploaded} />}

          {/* Analyzing Loading State */}
          {store.analysisStatus === "loading" && (
            <div className="flex min-h-[500px] items-center justify-center rounded-3xl border border-gray-200 bg-white shadow-sm">
              <div className="text-center">
                <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
                <p className="text-lg font-semibold text-gray-900">Analyzing your product...</p>
                <p className="mt-1 text-sm text-gray-600">AI is generating marketing content</p>
              </div>
            </div>
          )}

          {/* Working State - Preview + Marketing Copy + Bottom Panel */}
          {store.sourceImageUrl && store.analysisStatus !== "loading" && (
            <>
              {/* Image Preview Tabs */}
              <ImagePreviewTabs
                sourceImageUrl={store.sourceImageUrl}
                fluxImageUrl={store.fluxImageUrl}
                finalImageUrl={store.finalImageUrl}
                onReset={handleReset}
              />

              {/* Marketing Copy Panel */}
              <AnimatePresence>
                {store.analysisStatus === "done" && (
                  <div className="mt-6">
                    <MarketingCopyPanel />
                  </div>
                )}
              </AnimatePresence>

              {/* Expandable Sections */}
              {(store.fluxImageUrl || store.finalImageUrl) && (
                <div className="mt-6 space-y-4">
                  <ExpandableSection title="Video Generator" defaultExpanded={false}>
                    <VideoGenerator
                      videoUrl={store.videoUrl}
                      videoStatus={store.videoStatus}
                      onGenerate={handleGenerateVideo}
                    />
                  </ExpandableSection>

                  <ExpandableSection title="Export Sizes" defaultExpanded={false}>
                    <PromotionExports
                      exports={exportItems}
                      onExport={handleExport}
                      exporting={exportSizes.isPending}
                    />
                  </ExpandableSection>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bottom Fixed Panel - Prompt Input */}
      {store.sourceImageUrl && store.analysisStatus === "done" && (
        <PromptBottomPanel
          onGenerate={handleGenerate}
          onReanalyze={handleReanalyze}
          generating={generateImage.isPending}
          reanalyzing={reanalyze.isPending}
          brandKits={brandKitsQuery.data?.map((k) => ({ id: k.id, name: k.name }))}
          selectedBrandKitId={selectedBrandKitId}
          onBrandKitChange={setSelectedBrandKitId}
        />
      )}
    </div>
  );
}
