const REMBG_URL = process.env.REMBG_SERVICE_URL ?? "http://localhost:5000";

export async function removeBackground(imageBuffer: Buffer, mimeType = "image/png"): Promise<Buffer> {
  const blob = new Blob([imageBuffer], { type: mimeType });

  const formData = new FormData();
  formData.append("file", blob, "image.png");

  const response = await fetch(`${REMBG_URL}/remove-background`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Background removal failed: ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function checkRembgHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${REMBG_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
