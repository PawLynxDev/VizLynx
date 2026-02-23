import { create } from "zustand";

export interface CopyVariation {
  texts: Record<number, string>;
}

interface EditorState {
  textOverrides: Record<string, string>;
  selectedCopyVariation: number | null;
  copyVariations: CopyVariation[];
  selectedSizeId: string;

  setTextOverride: (index: number, value: string) => void;
  setTextOverrides: (overrides: Record<string, string>) => void;
  setCopyVariations: (variations: CopyVariation[]) => void;
  selectCopyVariation: (index: number) => void;
  setSelectedSizeId: (sizeId: string) => void;
  reset: () => void;
}

const initialState = {
  textOverrides: {} as Record<string, string>,
  selectedCopyVariation: null as number | null,
  copyVariations: [] as CopyVariation[],
  selectedSizeId: "square",
};

export const useEditorStore = create<EditorState>((set) => ({
  ...initialState,

  setTextOverride: (index, value) =>
    set((state) => ({
      textOverrides: { ...state.textOverrides, [String(index)]: value },
    })),

  setTextOverrides: (overrides) => set({ textOverrides: overrides }),

  setCopyVariations: (variations) =>
    set({ copyVariations: variations, selectedCopyVariation: null }),

  selectCopyVariation: (index) =>
    set((state) => {
      const variation = state.copyVariations[index];
      if (!variation) return state;
      const overrides: Record<string, string> = {};
      for (const [k, v] of Object.entries(variation.texts)) {
        overrides[String(k)] = v;
      }
      return {
        selectedCopyVariation: index,
        textOverrides: overrides,
      };
    }),

  setSelectedSizeId: (sizeId) => set({ selectedSizeId: sizeId }),

  reset: () => set(initialState),
}));
