"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { usePromotionStore } from "@/stores/promotionStore";
import { ProductUploader } from "@/components/promote/ProductUploader";
import { AnalysisPanel } from "@/components/promote/AnalysisPanel";
import { FluxPreview } from "@/components/promote/FluxPreview";
import { TextOverlayEditor } from "@/components/promote/TextOverlayEditor";
import { VideoGenerator } from "@/components/promote/VideoGenerator";
import { PromotionExports } from "@/components/promote/PromotionExports";
import { toast } from "sonner";

export default function PromotePage() {
  const store = usePromotionStore();
  const [textPosition, setTextPosition] = useState<"top" | "center" | "bottom">("bottom");
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

  const compositeText = trpc.promotion.compositeText.useMutation({
    onSuccess: (data) => {
      if (data.finalImageUrl) {
        store.setFinalImage(data.finalImageUrl);
      }
    },
    onError: (err) => {
      store.setCompositingStatus("error");
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
    if (!store.promotionId) return;
    store.setImageGenerationStatus("loading");

    generateImage.mutate({
      id: store.promotionId,
      prompt: store.editedFluxPrompt,
    });
  };

  const handleReanalyze = (tone: string) => {
    if (!store.promotionId) return;
    reanalyze.mutate({
      id: store.promotionId,
      tone,
      brandKitId: selectedBrandKitId,
    });
  };

  const handleApplyText = () => {
    if (!store.promotionId) return;
    store.setCompositingStatus("loading");

    compositeText.mutate({
      id: store.promotionId,
      headline: store.editedHeadline,
      subline: store.editedSubline || undefined,
      cta: store.editedCta || undefined,
      textPosition,
    });
  };

  const handleGenerateVideo = () => {
    if (!store.promotionId) return;
    store.setVideoStatus("loading");

    generateVideo.mutate({
      id: store.promotionId,
    });
  };

  const handleExport = (sizeIds: string[]) => {
    if (!store.promotionId || sizeIds.length === 0) return;
    exportSizes.mutate({
      id: store.promotionId,
      sizeIds,
    });
  };

  const handleStartOver = () => {
    store.reset();
    setExportItems([]);
    setTextPosition("bottom");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Sparkles className="h-6 w-6 text-violet-600" />
            Product Promotion
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload a product photo and let AI create marketing content
          </p>
        </div>
        {store.promotionId && (
          <button
            onClick={handleStartOver}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Start Over
          </button>
        )}
      </div>

      {/* Section 1: Upload */}
      {!store.sourceImageUrl && <ProductUploader onUploaded={handleUploaded} />}

      {/* Analyzing spinner */}
      {store.analysisStatus === "loading" && (
        <div className="flex items-center gap-3 rounded-lg border bg-white p-6">
          <Loader2 className="h-5 w-5 animate-spin text-violet-600" />
          <div>
            <p className="text-sm font-medium">Analyzing your product...</p>
            <p className="text-xs text-gray-500">AI is generating a marketing prompt and copy</p>
          </div>
        </div>
      )}

      {/* Source image preview (small) */}
      {store.sourceImageUrl && store.analysisStatus !== "loading" && (
        <div className="flex items-center gap-4 rounded-lg border bg-white p-4">
          <img
            src={store.sourceImageUrl}
            alt="Source"
            className="h-16 w-16 rounded-lg object-cover"
          />
          <div className="text-sm">
            <p className="font-medium">Product photo uploaded</p>
            <p className="text-gray-500">
              {store.analysisStatus === "done" ? "AI analysis complete" : "Ready to analyze"}
            </p>
          </div>
        </div>
      )}

      {/* Section 2: Edit Prompt & Text */}
      {store.analysisStatus === "done" && (
        <AnalysisPanel
          onGenerate={handleGenerate}
          onReanalyze={handleReanalyze}
          generating={generateImage.isPending}
          reanalyzing={reanalyze.isPending}
          brandKits={brandKitsQuery.data?.map((k) => ({ id: k.id, name: k.name }))}
          selectedBrandKitId={selectedBrandKitId}
          onBrandKitChange={setSelectedBrandKitId}
        />
      )}

      {/* Section 3: Flux Preview + Text Overlay */}
      {store.fluxImageUrl && !store.finalImageUrl && (
        <FluxPreview
          fluxImageUrl={store.fluxImageUrl}
          onRegenerate={handleGenerate}
          onApplyText={handleApplyText}
          regenerating={generateImage.isPending}
          applyingText={compositeText.isPending}
          textPosition={textPosition}
          onTextPositionChange={setTextPosition}
        />
      )}

      {/* Final image with text */}
      {store.finalImageUrl && <TextOverlayEditor finalImageUrl={store.finalImageUrl} />}

      {/* Section 4: Video & Export */}
      {(store.finalImageUrl || store.fluxImageUrl) && (
        <>
          <VideoGenerator
            videoUrl={store.videoUrl}
            videoStatus={store.videoStatus}
            onGenerate={handleGenerateVideo}
          />

          <PromotionExports
            exports={exportItems}
            onExport={handleExport}
            exporting={exportSizes.isPending}
          />
        </>
      )}
    </div>
  );
}
