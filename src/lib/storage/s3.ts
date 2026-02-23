const ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const API_TOKEN = process.env.R2_API_TOKEN!;
const BUCKET = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL!;

const R2_API_BASE = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/r2/buckets/${BUCKET}/objects`;

export function generateFileKey(
  prefix: "uploads" | "processed" | "generated",
  userId: string,
  projectId: string,
  ext: string
) {
  const id = crypto.randomUUID();
  return `${prefix}/${userId}/${projectId}/${id}.${ext}`;
}

export function getPublicUrl(fileKey: string) {
  return `${PUBLIC_URL}/${fileKey}`;
}

export async function uploadBuffer(
  fileKey: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const response = await fetch(`${R2_API_BASE}/${encodeURIComponent(fileKey)}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "Content-Type": contentType,
    },
    body: buffer,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`R2 upload failed (${response.status}): ${text}`);
  }

  return getPublicUrl(fileKey);
}

export async function getObjectBuffer(fileKey: string): Promise<Buffer> {
  const response = await fetch(`${R2_API_BASE}/${encodeURIComponent(fileKey)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`R2 download failed (${response.status}): ${text}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export { BUCKET };
