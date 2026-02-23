/**
 * Test script for template rendering.
 * Usage: npx tsx scripts/test-render.ts <path-to-test-image>
 *
 * This creates a simple test image if no path provided,
 * then renders all 3 templates and saves to scripts/output/
 */
import { createCanvas } from "@napi-rs/canvas";
import { renderTemplate } from "../src/lib/media/templates";
import type { TemplateConfig } from "../src/types";
import fs from "fs";
import path from "path";

const outputDir = path.join(__dirname, "output");
fs.mkdirSync(outputDir, { recursive: true });

// Create a simple test product image (a colored rectangle on transparent bg)
function createTestImage(): Buffer {
  const canvas = createCanvas(400, 500);
  const ctx = canvas.getContext("2d");

  // Transparent background (default)
  // Draw a "product" shape
  ctx.fillStyle = "#4f46e5";
  ctx.beginPath();
  ctx.roundRect(50, 30, 300, 440, 20);
  ctx.fill();

  // Add some detail
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 32px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("PRODUCT", 200, 270);

  return Buffer.from(canvas.toBuffer("image/png"));
}

const templates: { name: string; config: TemplateConfig }[] = [
  {
    name: "product-showcase",
    config: {
      width: 1080,
      height: 1080,
      background: { type: "gradient", colors: ["#667eea", "#764ba2"], direction: "to bottom right" },
      layout: "centered",
      productImage: { maxWidth: 700, maxHeight: 700, x: "center", y: "center", offsetY: -40 },
      textOverlays: [
        { text: "NEW ARRIVAL", font: "Inter", size: 48, weight: "bold", color: "#ffffff", align: "center", x: "center", y: 900 },
        { text: "Shop Now", font: "Inter", size: 32, weight: "semibold", color: "#ffffff", align: "center", x: "center", y: 980, background: { color: "rgba(0,0,0,0.3)", paddingX: 40, paddingY: 12, borderRadius: 8 } },
      ],
    },
  },
  {
    name: "social-post",
    config: {
      width: 1080,
      height: 1080,
      background: { type: "solid", color: "#f8f9fa" },
      layout: "split_horizontal",
      productImage: { maxWidth: 500, maxHeight: 800, x: 40, y: "center" },
      textOverlays: [
        { text: "TRENDING NOW", font: "Inter", size: 28, weight: "bold", color: "#6c63ff", align: "left", x: 580, y: 300 },
        { text: "Your Product", font: "Inter", size: 56, weight: "bold", color: "#1a1a2e", align: "left", x: 580, y: 360 },
        { text: "Name Here", font: "Inter", size: 56, weight: "bold", color: "#1a1a2e", align: "left", x: 580, y: 430 },
        { text: "Discover More", font: "Inter", size: 28, weight: "semibold", color: "#ffffff", align: "center", x: 700, y: 560, background: { color: "#6c63ff", paddingX: 36, paddingY: 14, borderRadius: 8 } },
      ],
    },
  },
  {
    name: "sale-promo",
    config: {
      width: 1080,
      height: 1080,
      background: { type: "gradient", colors: ["#ff416c", "#ff4b2b"], direction: "to bottom right" },
      layout: "overlay",
      productImage: { maxWidth: 600, maxHeight: 600, x: "center", y: "center", offsetY: 20 },
      textOverlays: [
        { text: "MEGA SALE", font: "Inter", size: 72, weight: "bold", color: "#ffffff", align: "center", x: "center", y: 120 },
        { text: "UP TO 50% OFF", font: "Inter", size: 36, weight: "semibold", color: "#fff3cd", align: "center", x: "center", y: 210 },
        { text: "Shop Now", font: "Inter", size: 32, weight: "bold", color: "#ff416c", align: "center", x: "center", y: 960, background: { color: "#ffffff", paddingX: 48, paddingY: 14, borderRadius: 30 } },
      ],
    },
  },
];

async function main() {
  // Use provided image or create test image
  let imageUrl: string;
  const inputPath = process.argv[2];

  if (inputPath && fs.existsSync(inputPath)) {
    // Write to a temp file and use file:// URL
    const absPath = path.resolve(inputPath);
    imageUrl = `file://${absPath}`;
    console.log(`Using input image: ${absPath}`);
  } else {
    // Create and save test image
    const testBuffer = createTestImage();
    const testPath = path.join(outputDir, "test-product.png");
    fs.writeFileSync(testPath, testBuffer);
    imageUrl = `file://${testPath}`;
    console.log(`Created test product image: ${testPath}`);
  }

  for (const template of templates) {
    console.log(`Rendering ${template.name}...`);
    try {
      const buffer = await renderTemplate(imageUrl, template.config);
      const outPath = path.join(outputDir, `${template.name}.png`);
      fs.writeFileSync(outPath, buffer);
      console.log(`  ✓ Saved to ${outPath}`);
    } catch (err) {
      console.error(`  ✗ Failed: ${err}`);
    }
  }

  console.log("Done!");
}

main();
