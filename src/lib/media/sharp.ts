import sharp from "sharp";
import fs from "fs";

export async function fetchImageAsBuffer(url: string): Promise<Buffer> {
  // Handle file:// URLs (for testing)
  if (url.startsWith("file://")) {
    const filePath = url.replace("file://", "");
    return fs.readFileSync(filePath);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function resizeToFit(
  buffer: Buffer,
  maxWidth: number,
  maxHeight: number
): Promise<{ buffer: Buffer; width: number; height: number }> {
  const resized = sharp(buffer).resize(maxWidth, maxHeight, {
    fit: "inside",
    withoutEnlargement: true,
  });

  const outputBuffer = await resized.png().toBuffer();
  const metadata = await sharp(outputBuffer).metadata();

  return {
    buffer: outputBuffer,
    width: metadata.width ?? maxWidth,
    height: metadata.height ?? maxHeight,
  };
}
