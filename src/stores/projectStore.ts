import { create } from "zustand";

interface ProjectState {
  sourceImageId: string | null;
  sourceImageUrl: string | null;
  processedImageUrl: string | null;
  generatedImageUrl: string | null;
  uploadProgress: number;
  bgRemovalStatus: "idle" | "processing" | "done" | "error";
  generationStatus: "idle" | "processing" | "done" | "error";

  setSourceImage: (id: string, url: string) => void;
  setProcessedImage: (url: string) => void;
  setGeneratedImage: (url: string) => void;
  setUploadProgress: (progress: number) => void;
  setBgRemovalStatus: (status: ProjectState["bgRemovalStatus"]) => void;
  setGenerationStatus: (status: ProjectState["generationStatus"]) => void;
  reset: () => void;
}

const initialState = {
  sourceImageId: null,
  sourceImageUrl: null,
  processedImageUrl: null,
  generatedImageUrl: null,
  uploadProgress: 0,
  bgRemovalStatus: "idle" as const,
  generationStatus: "idle" as const,
};

export const useProjectStore = create<ProjectState>((set) => ({
  ...initialState,

  setSourceImage: (id, url) => set({ sourceImageId: id, sourceImageUrl: url }),
  setProcessedImage: (url) =>
    set({ processedImageUrl: url, bgRemovalStatus: "done" }),
  setGeneratedImage: (url) =>
    set({ generatedImageUrl: url, generationStatus: "done" }),
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  setBgRemovalStatus: (status) => set({ bgRemovalStatus: status }),
  setGenerationStatus: (status) => set({ generationStatus: status }),
  reset: () => set(initialState),
}));
