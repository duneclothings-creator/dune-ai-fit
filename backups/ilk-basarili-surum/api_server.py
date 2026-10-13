
import io
import os
from pathlib import Path

import torch
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import Response
from PIL import Image, UnidentifiedImageError
from fashn_vton import TryOnPipeline

app = FastAPI(title="Dune AI Fit - Local API")

BASE_DIR = Path(__file__).resolve().parent
MAX_FILE_SIZE =20 * 1024 * 1024

pipeline = None


def get_pipeline():
    global pipeline

    if pipeline is None:
        pipeline = TryOnPipeline(
            weights_dir=str(BASE_DIR / "weights")
        )

    return pipeline


async def read_image(file: UploadFile):
    if file.content_type not in (
        "image/jpeg",
        "image/png",
        "image/webp",
    ):
        raise HTTPException(
            status_code=400,
            detail="Yalnızca JPG, PNG veya WebP yükleyebilirsiniz.",
        )

    data = await file.read(MAX_FILE_SIZE + 1)

    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Dosya 10 MB sınırını aşıyor.",
        )

    try:
        image = Image.open(io.BytesIO(data))
        image.load()
        return image.convert("RGB")
    except (UnidentifiedImageError, OSError, ValueError):
        raise HTTPException(
            status_code=400,
            detail="Geçersiz görsel dosyası.",
        )


@app.get("/health")
def health():
    return {
        "status": "ok",
        "gpu": torch.cuda.is_available(),
    }


@app.post("/try-on")
async def try_on(
    person: UploadFile = File(...),
    garment: UploadFile = File(...),
    category: str = Form("tops"),
):
    if category not in ("tops", "bottoms", "one-pieces"):
        raise HTTPException(
            status_code=400,
            detail="Geçersiz kıyafet kategorisi.",
        )

    person_image = await read_image(person)
    garment_image = await read_image(garment)

    try:
        model = get_pipeline()

        result = model(
            person_image=person_image,
            garment_image=garment_image,
            category=category,
        )

        output = io.BytesIO()
        result.images[0].save(output, format="PNG")

        return Response(
            content=output.getvalue(),
            media_type="image/png",
            headers={"Cache-Control": "no-store"},
        )

    except torch.cuda.OutOfMemoryError:
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

        raise HTTPException(
            status_code=503,
            detail="GPU belleği yetersiz.",
        )
