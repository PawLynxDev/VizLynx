import { createCanvas, Image as CanvasImage } from "@napi-rs/canvas";
import { fetchImageAsBuffer, resizeToFit } from "./sharp";
import { ensureFont } from "./fonts";
import type { TemplateConfig, TextOverlay } from "@/types";

function getFontString(overlay: TextOverlay): string {
  const weight = overlay.weight === "bold" ? "bold" : overlay.weight === "semibold" ? "600" : "normal";
  return `${weight} ${overlay.size}px ${overlay.font}, sans-serif`;
}

function parseGradientDirection(
  direction: string,
  width: number,
  height: number
): { x0: number; y0: number; x1: number; y1: number } {
  const map: Record<string, { x0: number; y0: number; x1: number; y1: number }> = {
    "to bottom": { x0: 0, y0: 0, x1: 0, y1: height },
    "to right": { x0: 0, y0: 0, x1: width, y1: 0 },
    "to bottom right": { x0: 0, y0: 0, x1: width, y1: height },
    "to bottom left": { x0: width, y0: 0, x1: 0, y1: height },
  };
  return map[direction] ?? map["to bottom"];
}

export async function renderTemplate(
  processedImageInput: string | Buffer,
  config: TemplateConfig
): Promise<Buffer> {
  const { width, height } = config;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // 0. Ensure all fonts are loaded
  for (const overlay of config.textOverlays) {
    ensureFont(overlay.font);
  }

  // 1. Draw background
  if (config.background.type === "gradient" && config.background.colors) {
    const dir = parseGradientDirection(config.background.direction ?? "to bottom", width, height);
    const gradient = ctx.createLinearGradient(dir.x0, dir.y0, dir.x1, dir.y1);
    const colors = config.background.colors;
    colors.forEach((color, i) => {
      gradient.addColorStop(i / (colors.length - 1), color);
    });
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.fillStyle = config.background.color ?? "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }

  // 2. Fetch + resize product image
  const productBuffer = Buffer.isBuffer(processedImageInput)
    ? processedImageInput
    : await fetchImageAsBuffer(processedImageInput);
  const product = await resizeToFit(
    productBuffer,
    config.productImage.maxWidth,
    config.productImage.maxHeight
  );

  const img = new CanvasImage();
  img.src = product.buffer;

  // 3. Position product image
  let px: number;
  let py: number;

  if (config.productImage.x === "center") {
    px = (width - product.width) / 2;
  } else {
    px = config.productImage.x;
  }

  if (config.productImage.y === "center") {
    py = (height - product.height) / 2;
  } else {
    py = config.productImage.y;
  }

  px += config.productImage.offsetX ?? 0;
  py += config.productImage.offsetY ?? 0;

  ctx.drawImage(img, px, py, product.width, product.height);

  // 4. Render text overlays
  drawTextOverlays(ctx, config.textOverlays, width);

  return Buffer.from(canvas.toBuffer("image/png"));
}

type CanvasContext = ReturnType<ReturnType<typeof createCanvas>["getContext"]>;

export function drawTextOverlays(
  ctx: CanvasContext,
  overlays: TextOverlay[],
  canvasWidth: number
): void {
  for (const overlay of overlays) {
    ctx.font = getFontString(overlay);
    ctx.fillStyle = overlay.color;
    ctx.textAlign = overlay.align;

    let tx: number;
    if (overlay.x === "center") {
      tx = canvasWidth / 2;
    } else {
      tx = overlay.x;
    }

    // Draw background rect if specified
    if (overlay.background) {
      const bg = overlay.background;
      const metrics = ctx.measureText(overlay.text);
      const textWidth = metrics.width;
      const textHeight = overlay.size;

      let bgX: number;
      if (overlay.align === "center") {
        bgX = tx - textWidth / 2 - bg.paddingX;
      } else if (overlay.align === "right") {
        bgX = tx - textWidth - bg.paddingX;
      } else {
        bgX = tx - bg.paddingX;
      }
      const bgY = overlay.y - textHeight + 4 - bg.paddingY;
      const bgW = textWidth + bg.paddingX * 2;
      const bgH = textHeight + bg.paddingY * 2;

      ctx.fillStyle = bg.color;
      if (bg.borderRadius > 0) {
        drawRoundedRect(ctx, bgX, bgY, bgW, bgH, bg.borderRadius);
        ctx.fill();
      } else {
        ctx.fillRect(bgX, bgY, bgW, bgH);
      }

      // Reset fill style for text
      ctx.fillStyle = overlay.color;
    }

    ctx.fillText(overlay.text, tx, overlay.y);
  }
}

function drawRoundedRect(
  ctx: ReturnType<ReturnType<typeof createCanvas>["getContext"]>,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function scaleConfig(
  config: TemplateConfig,
  targetWidth: number,
  targetHeight: number
): TemplateConfig {
  const scaleX = targetWidth / config.width;
  const scaleY = targetHeight / config.height;

  const scaleNum = (v: number | "center", axis: "x" | "y"): number | "center" => {
    if (v === "center") return "center";
    return Math.round(v * (axis === "x" ? scaleX : scaleY));
  };

  return {
    width: targetWidth,
    height: targetHeight,
    background: { ...config.background },
    layout: config.layout,
    productImage: {
      maxWidth: Math.round(config.productImage.maxWidth * scaleX),
      maxHeight: Math.round(config.productImage.maxHeight * scaleY),
      x: scaleNum(config.productImage.x, "x"),
      y: scaleNum(config.productImage.y, "y"),
      offsetX: config.productImage.offsetX ? Math.round(config.productImage.offsetX * scaleX) : undefined,
      offsetY: config.productImage.offsetY ? Math.round(config.productImage.offsetY * scaleY) : undefined,
    },
    textOverlays: config.textOverlays.map((overlay) => ({
      ...overlay,
      size: Math.round(overlay.size * Math.min(scaleX, scaleY)),
      x: scaleNum(overlay.x, "x"),
      y: Math.round(overlay.y * scaleY),
      background: overlay.background
        ? {
            ...overlay.background,
            paddingX: Math.round(overlay.background.paddingX * scaleX),
            paddingY: Math.round(overlay.background.paddingY * scaleY),
            borderRadius: Math.round(overlay.background.borderRadius * Math.min(scaleX, scaleY)),
          }
        : undefined,
    })),
  };
}
