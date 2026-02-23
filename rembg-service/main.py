from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import Response
from rembg import remove
from PIL import Image
import io

app = FastAPI(title="PixelForge Background Removal Service")

MAX_SIZE = 10 * 1024 * 1024  # 10MB


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/remove-background")
async def remove_background(file: UploadFile = File(...)):
    if file.content_type not in ("image/jpeg", "image/png", "image/webp"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only JPEG, PNG, and WebP are allowed.",
        )

    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum is 10MB.")

    try:
        input_image = Image.open(io.BytesIO(contents))
        output_image = remove(input_image)

        buf = io.BytesIO()
        output_image.save(buf, format="PNG")
        buf.seek(0)

        return Response(
            content=buf.getvalue(),
            media_type="image/png",
            headers={"Content-Disposition": "attachment; filename=removed_bg.png"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Background removal failed: {str(e)}")
