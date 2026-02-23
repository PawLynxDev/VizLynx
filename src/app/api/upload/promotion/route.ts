import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { uploadBuffer, getPublicUrl } from "@/lib/storage/s3";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 10MB." },
      { status: 400 }
    );
  }

  const ext = file.name.split(".").pop() ?? "png";
  const fileKey = `promotion-uploads/${userId}/${crypto.randomUUID()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await uploadBuffer(fileKey, buffer, file.type);
  const publicUrl = getPublicUrl(fileKey);

  return NextResponse.json({
    fileKey,
    publicUrl,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  });
}
