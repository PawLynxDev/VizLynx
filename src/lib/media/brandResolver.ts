import type { TemplateConfig } from "@/types";

export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface BrandFonts {
  heading: string;
  body: string;
}

export interface Brand {
  colors: BrandColors;
  fonts: BrandFonts;
}

export const DEFAULT_BRAND: Brand = {
  colors: {
    primary: "#6c63ff",
    secondary: "#1a1a2e",
    accent: "#ff6b6b",
    background: "#ffffff",
    text: "#1a1a2e",
  },
  fonts: {
    heading: "Inter",
    body: "Inter",
  },
};

const COLOR_SLOTS: Record<string, keyof BrandColors> = {
  "{{primary}}": "primary",
  "{{secondary}}": "secondary",
  "{{accent}}": "accent",
  "{{background}}": "background",
  "{{text}}": "text",
};

const FONT_SLOTS: Record<string, keyof BrandFonts> = {
  "{{heading}}": "heading",
  "{{body}}": "body",
};

export function resolveColor(value: string, colors: BrandColors): string {
  const slot = COLOR_SLOTS[value];
  return slot ? colors[slot] : value;
}

export function resolveFont(value: string, fonts: BrandFonts): string {
  const slot = FONT_SLOTS[value];
  return slot ? fonts[slot] : value;
}

export function resolveConfig(config: TemplateConfig, brand: Brand): TemplateConfig {
  const resolved = structuredClone(config);

  // Resolve background colors
  if (resolved.background.color) {
    resolved.background.color = resolveColor(resolved.background.color, brand.colors);
  }
  if (resolved.background.colors) {
    resolved.background.colors = resolved.background.colors.map((c) =>
      resolveColor(c, brand.colors)
    );
  }

  // Resolve text overlays
  resolved.textOverlays = resolved.textOverlays.map((overlay) => ({
    ...overlay,
    color: resolveColor(overlay.color, brand.colors),
    font: resolveFont(overlay.font, brand.fonts),
    background: overlay.background
      ? {
          ...overlay.background,
          color: resolveColor(overlay.background.color, brand.colors),
        }
      : undefined,
  }));

  return resolved;
}
