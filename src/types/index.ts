export interface TextBackground {
  color: string;
  paddingX: number;
  paddingY: number;
  borderRadius: number;
}

export interface TextOverlay {
  text: string;
  font: string;
  size: number;
  weight: string;
  color: string;
  align: "left" | "center" | "right";
  x: number | "center";
  y: number;
  background?: TextBackground;
}

export interface TemplateBackground {
  type: "solid" | "gradient";
  color?: string;
  colors?: string[];
  direction?: string;
}

export interface ProductImageConfig {
  maxWidth: number;
  maxHeight: number;
  x: number | "center";
  y: number | "center";
  offsetX?: number;
  offsetY?: number;
}

export interface TemplateConfig {
  width: number;
  height: number;
  background: TemplateBackground;
  layout: "centered" | "split_horizontal" | "overlay";
  productImage: ProductImageConfig;
  textOverlays: TextOverlay[];
}

// Color fields in TemplateConfig accept semantic slots like "{{primary}}", "{{secondary}}", "{{accent}}"
// alongside regular hex values. Font fields accept "{{heading}}" and "{{body}}".
// These are resolved by brandResolver.ts at render time.

export interface ExportSize {
  id: string;
  label: string;
  width: number;
  height: number;
  aspect: string;
}

export const EXPORT_SIZES: ExportSize[] = [
  { id: "square", label: "Square Post", width: 1080, height: 1080, aspect: "1:1" },
  { id: "story", label: "Story / Reel", width: 1080, height: 1920, aspect: "9:16" },
  { id: "fb-ad", label: "Facebook Ad", width: 1200, height: 628, aspect: "1.91:1" },
  { id: "portrait", label: "Portrait (4:5)", width: 1080, height: 1350, aspect: "4:5" },
  { id: "yt-thumb", label: "YouTube Thumbnail", width: 1920, height: 1080, aspect: "16:9" },
];
