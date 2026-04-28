import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const serpApiKey = process.env.SERPAPI_API_KEY;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!serpApiKey || !uploadPreset) {
    return NextResponse.json({ error: "API keys no configuradas" }, { status: 500 });
  }

  const formData = await req.formData();
  const file = formData.get("image") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No se recibió imagen" }, { status: 400 });
  }

  // 1. Subir a Cloudinary para obtener URL pública
  const cloudForm = new FormData();
  cloudForm.append("file", file);
  cloudForm.append("upload_preset", uploadPreset);

  const uploadRes = await fetch("https://api.cloudinary.com/v1_1/gigga/image/upload", {
    method: "POST",
    body: cloudForm,
  });

  if (!uploadRes.ok) {
    return NextResponse.json({ error: "Error al subir imagen" }, { status: 500 });
  }

  const { secure_url: imageUrl } = (await uploadRes.json()) as { secure_url: string };

  // 2. Google Lens via SerpAPI
  const params = new URLSearchParams({
    engine: "google_lens",
    url: imageUrl,
    api_key: serpApiKey,
  });

  const lensRes = await fetch(`https://serpapi.com/search?${params}`);

  if (!lensRes.ok) {
    if (lensRes.status === 429) {
      return NextResponse.json({ error: "quota_exceeded" }, { status: 429 });
    }
    return NextResponse.json({ error: "Error en Google Lens" }, { status: 500 });
  }

  const lensData = await lensRes.json();

  // 3. Extraer palabras clave del resultado
  const title: string =
    lensData.knowledge_graph?.title ||
    lensData.visual_matches?.[0]?.title ||
    "";

  if (!title) {
    return NextResponse.json({ keywords: null });
  }

  const keywords = title.split(/\s+/).slice(0, 4).join(" ").toLowerCase();

  return NextResponse.json({ keywords });
}
