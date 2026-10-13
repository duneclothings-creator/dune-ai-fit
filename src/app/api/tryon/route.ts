
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const response = await fetch(
      "http://127.0.0.1:8000/health",
      {
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Python API yanıt vermedi.",
        },
        { status: 502 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      python: data.status,
      gpu: data.gpu,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Python API bağlantısı kurulamadı.",
      },
      { status: 502 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const person = formData.get("person");
    const garment = formData.get("garment");
    const category = formData.get("category");

    if (!(person instanceof File) || !(garment instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "Kişi ve ürün fotoğrafları gerekli.",
        },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
   const maxSize = 20 * 1024 * 1024;
    console.log("DUNE AI FIT DOSYA KONTROLÜ", {
  person: {
    name: person.name,
    type: person.type,
    sizeMB: (person.size / 1024 / 1024).toFixed(2),
  },
  garment: {
    name: garment.name,
    type: garment.type,
    sizeMB: (garment.size / 1024 / 1024).toFixed(2),
  },
});

    if (
      !allowedTypes.includes(person.type) ||
      !allowedTypes.includes(garment.type) ||
      person.size > maxSize ||
      garment.size > maxSize
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "JPG, PNG veya WebP formatında, en fazla 10 MB fotoğraf yükleyin.",
        },
        { status: 400 }
      );
    }

    const pythonForm = new FormData();
    pythonForm.append("person", person);
    pythonForm.append("garment", garment);
    pythonForm.append("category", category === "bottoms" ? "bottoms" : "tops");

    const response = await fetch("http://127.0.0.1:8000/try-on", {
      method: "POST",
      body: pythonForm,
      cache: "no-store",
      signal: AbortSignal.timeout(180000),
    });

    if (!response.ok) {
      const details = await response.text();

      return NextResponse.json(
        {
          success: false,
          message: "Yapay zekâ işlemi başarısız oldu.",
          details: details.slice(0, 500),
        },
        { status: 502 }
      );
    }

    const image = await response.arrayBuffer();

    return new Response(image, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Yapay zekâ sunucusuna bağlanılamadı veya işlem zaman aşımına uğradı.",
      },
      { status: 502 }
    );
  }
}
