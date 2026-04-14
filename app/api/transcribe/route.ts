import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY no configurada" }, { status: 500 });
  }

  const formData = await req.formData();
  const audio = formData.get("audio") as File | null;
  if (!audio) {
    return NextResponse.json({ error: "No se recibió audio" }, { status: 400 });
  }

  const body = new FormData();
  body.append("file", audio, "audio.webm");
  body.append("model", "whisper-1");
  body.append("language", "es");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body,
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Whisper error" }, { status: 500 });
  }

  const data = (await res.json()) as { text?: string };
  return NextResponse.json({ transcript: data.text ?? null });
}
