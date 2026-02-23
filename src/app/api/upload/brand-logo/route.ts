import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { uploadBuffer, getPublicUrl } from "@/lib/storage/s3";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const brandKitId = formData.get("brandKitId") as string | null;
  const variant = formData.get("variant") as string | null; // "light" or "dark"

  if (!file || !brandKitId || !variant) {
    return NextResponse.json(
      { error: "Missing file, brandKitId, or variant" },
      { status: 400 }
    );
  }

  if (!["light", "dark"].includes(variant)) {
    return NextResponse.json(
      { error: "Variant must be 'light' or 'dark'" },
      { status: 400 }
    );
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Only JPEG, PNG, WebP, and SVG are allowed." },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 5MB." },
      { status: 400 }
    );
  }

  const ext = file.name.split(".").pop() ?? "png";
  const fileKey = `brandkit/${userId}/${brandKitId}/${variant}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await uploadBuffer(fileKey, buffer, file.type);
  const publicUrl = getPublicUrl(fileKey);

  return NextResponse.json({ fileKey, publicUrl });
}
