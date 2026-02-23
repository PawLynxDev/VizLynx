import { fal } from "@fal-ai/client";

fal.config({ credentials: process.env.FAL_KEY! });

interface FluxResult {
  imageUrl: string;
  width: number;
  height: number;
  seed: number;
}

export async function generateFluxImage({
  prompt,
  imageUrl,
  aspectRatio = "1:1",
  seed,
}: {
  prompt: string;
  imageUrl: string;
  aspectRatio?: string;
  seed?: number;
}): Promise<FluxResult> {
  const result = await fal.subscribe("fal-ai/flux-pro/kontext", {
    input: {
      prompt,
      image_url: imageUrl,
      aspect_ratio: aspectRatio as "1:1",
      ...(seed != null && { seed }),
    },
  });

  const data = result.data as {
    images: Array<{ url: string; width: number; height: number }>;
    seed: number;
  };

  const image = data.images[0];
  return {
    imageUrl: image.url,
    width: image.width,
    height: image.height,
    seed: data.seed,
  };
}

interface KlingResult {
  videoUrl: string;
}

export async function generateKlingVideo({
  prompt,
  imageUrl,
  duration = "5",
  aspectRatio = "1:1",
}: {
  prompt: string;
  imageUrl: string;
  duration?: string;
  aspectRatio?: string;
}): Promise<KlingResult> {
  const result = await fal.subscribe("fal-ai/kling-video/v2.1/pro/image-to-video", {
    input: {
      prompt,
      image_url: imageUrl,
      duration: duration as "5",
    },
  });

  const data = result.data as {
    video: { url: string };
  };

  return { videoUrl: data.video.url };
}
