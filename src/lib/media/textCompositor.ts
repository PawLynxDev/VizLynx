import { createCanvas, Image as CanvasImage } from "@napi-rs/canvas";
import sharp from "sharp";
import { ensureFont } from "./fonts";
import { drawTextOverlays } from "./templates";
import type { TextOverlay } from "@/types";

export async function compositeTextOnImage({
  baseImageBuffer,
  textOverlays,
  targetWidth,
  targetHeight,
}: {
  baseImageBuffer: Buffer;
  textOverlays: TextOverlay[];
  targetWidth?: number;
  targetHeight?: number;
}): Promise<Buffer> {
  // Get image dimensions
  const metadata = await sharp(baseImageBuffer).metadata();
  const imgWidth = targetWidth ?? metadata.width ?? 1080;
  const imgHeight = targetHeight ?? metadata.height ?? 1080;

  // Resize base image if target dimensions differ
  let processedBuffer = baseImageBuffer;
  if (targetWidth || targetHeight) {
    processedBuffer = await sharp(baseImageBuffer)
      .resize(imgWidth, imgHeight, { fit: "cover" })
      .png()
      .toBuffer();
  }

  // Ensure PNG for canvas loading
  processedBuffer = await sharp(processedBuffer).png().toBuffer();

  // Create canvas and draw base image
  const canvas = createCanvas(imgWidth, imgHeight);
  const ctx = canvas.getContext("2d");

  const img = new CanvasImage();
  img.src = processedBuffer;
  ctx.drawImage(img, 0, 0, imgWidth, imgHeight);

  // Ensure fonts are loaded
  for (const overlay of textOverlays) {
    ensureFont(overlay.font);
  }

  // Draw text overlays
  drawTextOverlays(ctx, textOverlays, imgWidth);

  return Buffer.from(canvas.toBuffer("image/png"));
}
