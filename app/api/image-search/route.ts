import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GOOGLE_GEMINI_API_KEY no configurada" }, { status: 500 });
  }

  const formData = await req.formData();
  const file = formData.get("image") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No se recibió imagen" }, { status: 400 });
  }

  // Convertir a base64
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const mimeType = file.type || "image/jpeg";

  const body = {
    contents: [
      {
        parts: [
          {
            text: `Analiza esta imagen e identifica qué producto o tipo de producto es.
Responde SOLO con 2 a 4 palabras clave en español para buscar ese producto en una tienda online.
No expliques, no uses signos de puntuación, solo las palabras clave separadas por espacios.
Ejemplos de respuesta: "audífonos bluetooth", "zapatillas running", "lámpara escritorio".`,
          },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      maxOutputTokens: 20,
      temperature: 0.1,
    },
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    const geminiCode = err?.error?.code ?? res.status;
    if (geminiCode === 429) {
      return NextResponse.json({ error: "quota_exceeded" }, { status: 429 });
    }
    return NextResponse.json({ error: "Gemini error" }, { status: 500 });
  }

  const data = await res.json();
  const keywords: string = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

  return NextResponse.json({ keywords });
}
