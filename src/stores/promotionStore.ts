import { create } from "zustand";

type Status = "idle" | "loading" | "done" | "error";

interface PromotionState {
  // Core
  promotionId: string | null;

  // Upload
  uploadProgress: number;
  sourceImageUrl: string | null;

  // Analysis
  analysisStatus: Status;
  suggestedFluxPrompt: string;
  suggestedHeadline: string;
  suggestedSubline: string;
  suggestedCta: string;
  editedFluxPrompt: string;
  editedHeadline: string;
  editedSubline: string;
  editedCta: string;

  // Image generation
  imageGenerationStatus: Status;
  fluxImageUrl: string | null;

  // Compositing
  compositingStatus: Status;
  finalImageUrl: string | null;

  // Video
  videoStatus: Status;
  videoUrl: string | null;

  // Export
  selectedSizeIds: string[];

  // Actions
  setPromotionId: (id: string) => void;
  setUploadProgress: (progress: number) => void;
  setSourceImage: (url: string) => void;
  setAnalysis: (data: {
    fluxPrompt: string;
    headline: string;
    subline: string;
    cta: string;
  }) => void;
  setAnalysisStatus: (status: Status) => void;
  setEditedFluxPrompt: (prompt: string) => void;
  setEditedHeadline: (headline: string) => void;
  setEditedSubline: (subline: string) => void;
  setEditedCta: (cta: string) => void;
  setImageGenerationStatus: (status: Status) => void;
  setFluxImage: (url: string) => void;
  setCompositingStatus: (status: Status) => void;
  setFinalImage: (url: string) => void;
  setVideoStatus: (status: Status) => void;
  setVideoUrl: (url: string) => void;
  setSelectedSizeIds: (ids: string[]) => void;
  reset: () => void;
}

const initialState = {
  promotionId: null,
  uploadProgress: 0,
  sourceImageUrl: null,
  analysisStatus: "idle" as Status,
  suggestedFluxPrompt: "",
  suggestedHeadline: "",
  suggestedSubline: "",
  suggestedCta: "",
  editedFluxPrompt: "",
  editedHeadline: "",
  editedSubline: "",
  editedCta: "",
  imageGenerationStatus: "idle" as Status,
  fluxImageUrl: null,
  compositingStatus: "idle" as Status,
  finalImageUrl: null,
  videoStatus: "idle" as Status,
  videoUrl: null,
  selectedSizeIds: [] as string[],
};

export const usePromotionStore = create<PromotionState>((set) => ({
  ...initialState,

  setPromotionId: (id) => set({ promotionId: id }),
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  setSourceImage: (url) => set({ sourceImageUrl: url }),
  setAnalysis: (data) =>
    set({
      analysisStatus: "done",
      suggestedFluxPrompt: data.fluxPrompt,
      suggestedHeadline: data.headline,
      suggestedSubline: data.subline,
      suggestedCta: data.cta,
      editedFluxPrompt: data.fluxPrompt,
      editedHeadline: data.headline,
      editedSubline: data.subline,
      editedCta: data.cta,
    }),
  setAnalysisStatus: (status) => set({ analysisStatus: status }),
  setEditedFluxPrompt: (prompt) => set({ editedFluxPrompt: prompt }),
  setEditedHeadline: (headline) => set({ editedHeadline: headline }),
  setEditedSubline: (subline) => set({ editedSubline: subline }),
  setEditedCta: (cta) => set({ editedCta: cta }),
  setImageGenerationStatus: (status) => set({ imageGenerationStatus: status }),
  setFluxImage: (url) => set({ fluxImageUrl: url, imageGenerationStatus: "done" }),
  setCompositingStatus: (status) => set({ compositingStatus: status }),
  setFinalImage: (url) => set({ finalImageUrl: url, compositingStatus: "done" }),
  setVideoStatus: (status) => set({ videoStatus: status }),
  setVideoUrl: (url) => set({ videoUrl: url, videoStatus: "done" }),
  setSelectedSizeIds: (ids) => set({ selectedSizeIds: ids }),
  reset: () => set(initialState),
}));
