import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export interface CopyInput {
  productName: string;
  productDescription: string;
  templateCategory: string;
  tone: "professional" | "casual" | "bold" | "playful";
  textSlots: { index: number; placeholder: string }[];
}

export interface CopyVariation {
  texts: Record<number, string>;
}

export async function generateCopy(input: CopyInput): Promise<CopyVariation[]> {
  const slotDescriptions = input.textSlots
    .map((s) => `  Slot ${s.index}: "${s.placeholder}"`)
    .join("\n");

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are a marketing copywriter. Generate 3 variations of marketing copy for a product.

Product: ${input.productName}
Description: ${input.productDescription}
Template type: ${input.templateCategory}
Tone: ${input.tone}

The template has these text slots that need copy:
${slotDescriptions}

Return ONLY a JSON array of 3 objects. Each object has a "texts" field mapping slot index numbers to replacement text strings. Keep text concise — headlines under 5 words, subheadlines under 8 words, CTAs under 3 words.

Example format:
[
  {"texts": {"0": "SUMMER ESSENTIALS", "1": "Fresh styles for you", "2": "Shop Now"}},
  {"texts": {"0": "NEW ARRIVALS", "1": "Discover the collection", "2": "Buy Now"}},
  {"texts": {"0": "TRENDING TODAY", "1": "Don't miss out", "2": "Get Yours"}}
]`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Failed to parse AI copy response");
  }

  const parsed = JSON.parse(jsonMatch[0]) as { texts: Record<string, string> }[];

  return parsed.map((v) => ({
    texts: Object.fromEntries(
      Object.entries(v.texts).map(([k, val]) => [Number(k), val])
    ),
  }));
}
