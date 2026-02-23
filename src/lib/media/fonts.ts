import { GlobalFonts } from "@napi-rs/canvas";
import path from "path";
import fs from "fs";

export const FONT_LIST = [
  "Inter",
  "Poppins",
  "Lato",
  "Barlow",
  "Bebas Neue",
  "Crimson Text",
] as const;

export type FontFamily = (typeof FONT_LIST)[number];

const fontsDir = path.join(process.cwd(), "public", "fonts");
const loadedFonts = new Set<string>();

export function ensureFont(family: string): void {
  if (loadedFonts.has(family)) return;

  const slug = family.replace(/\s+/g, "_");
  const regularPath = path.join(fontsDir, `${slug}-Regular.ttf`);
  const boldPath = path.join(fontsDir, `${slug}-Bold.ttf`);

  if (fs.existsSync(regularPath)) {
    GlobalFonts.registerFromPath(regularPath, family);
  }
  if (fs.existsSync(boldPath)) {
    GlobalFonts.registerFromPath(boldPath, `${family} Bold`);
  }

  // Also try Inter-style naming (no underscore)
  if (!fs.existsSync(regularPath)) {
    const altSlug = family.replace(/\s+/g, "");
    const altRegular = path.join(fontsDir, `${altSlug}-Regular.ttf`);
    const altBold = path.join(fontsDir, `${altSlug}-Bold.ttf`);
    if (fs.existsSync(altRegular)) {
      GlobalFonts.registerFromPath(altRegular, family);
    }
    if (fs.existsSync(altBold)) {
      GlobalFonts.registerFromPath(altBold, `${family} Bold`);
    }
  }

  loadedFonts.add(family);
}
