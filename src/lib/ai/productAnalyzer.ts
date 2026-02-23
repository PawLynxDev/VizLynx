import Anthropic from "@anthropic-ai/sdk";
import sharp from "sharp";

const anthropic = new Anthropic();

interface AnalysisResult {
  fluxPrompt: string;
  headline: string;
  subline: string;
  cta: string;
  productDescription: string;
}

export async function analyzeProduct({
  imageBuffer,
  mimeType,
  brandContext,
  tone = "professional",
}: {
  imageBuffer: Buffer;
  mimeType: string;
  brandContext?: string;
  tone?: string;
}): Promise<AnalysisResult> {
  // Resize to max 2048x2048 to stay within base64 limits
  const resized = await sharp(imageBuffer)
    .resize(2048, 2048, { fit: "inside", withoutEnlargement: true })
    .png()
    .toBuffer();

  const base64 = resized.toString("base64");
  const mediaType = (mimeType === "image/jpeg" ? "image/jpeg" : "image/png") as
    | "image/jpeg"
    | "image/png"
    | "image/gif"
    | "image/webp";

  const brandLine = brandContext
    ? `\nBrand context: ${brandContext}`
    : "";

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: base64 },
          },
          {
            type: "text",
            text: `You are a product marketing expert. Analyze this product photo and generate:

1. A "Flux prompt" — a creative, detailed image generation prompt that describes an eye-catching marketing scene featuring this product. Include lighting, style, mood, and composition details. Start with the product description, then describe the scene around it. Do NOT include any text or typography instructions in the prompt.

2. Marketing copy — a headline (max 8 words), a subline (max 15 words), and a CTA button text (max 4 words).

3. A brief product description (1-2 sentences).

Tone: ${tone}${brandLine}

Respond ONLY with valid JSON (no markdown fences):
{
  "fluxPrompt": "...",
  "headline": "...",
  "subline": "...",
  "cta": "...",
  "productDescription": "..."
}`,
          },
        ],
      },
    ],
  });

  const raw = response.content[0].type === "text" ? response.content[0].text : "";
  // Strip markdown fences if the model wraps the JSON in ```json ... ```
  const text = raw.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
  const parsed = JSON.parse(text) as AnalysisResult;
  return parsed;
}
