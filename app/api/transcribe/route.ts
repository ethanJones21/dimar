import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ASSEMBLY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ASSEMBLY_API_KEY no configurada" }, { status: 500 });
  }

  const formData = await req.formData();
  const audio = formData.get("audio") as File | null;
  if (!audio) {
    return NextResponse.json({ error: "No se recibió audio" }, { status: 400 });
  }

  const headers = { authorization: apiKey };

  // 1. Subir el audio a AssemblyAI
  const uploadRes = await fetch("https://api.assemblyai.com/v2/upload", {
    method: "POST",
    headers: { ...headers, "content-type": "application/octet-stream" },
    body: await audio.arrayBuffer(),
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    return NextResponse.json({ error: `Upload error: ${err}` }, { status: 500 });
  }

  const { upload_url } = (await uploadRes.json()) as { upload_url: string };

  // 2. Solicitar transcripción
  const transcriptRes = await fetch("https://api.assemblyai.com/v2/transcript", {
    method: "POST",
    headers: { ...headers, "content-type": "application/json" },
    body: JSON.stringify({ audio_url: upload_url, speech_models: ["universal-2"], language_code: "es" }),
  });

  if (!transcriptRes.ok) {
    const err = await transcriptRes.text();
    return NextResponse.json({ error: `Transcript error: ${err}` }, { status: 500 });
  }

  const { id } = (await transcriptRes.json()) as { id: string };

  // 3. Polling: espera inicial 800ms (clips cortos suelen estar listos), luego cada 300ms
  const pollUrl = `https://api.assemblyai.com/v2/transcript/${id}`;
  const delays = [800, 300, 300, 300, 300, 300, 300, 300, 400, 400, 500, 500, 500, 500, 500];
  for (const delay of delays) {
    await new Promise((r) => setTimeout(r, delay));
    const pollRes = await fetch(pollUrl, { headers });
    const poll = (await pollRes.json()) as {
      status: string;
      text?: string;
      error?: string;
    };

    if (poll.status === "completed") {
      const text = (poll.text ?? "").replace(/[.,;:!?¡¿]+$/, "").trim();
      return NextResponse.json({ transcript: text || null });
    }
    if (poll.status === "error") {
      return NextResponse.json(
        { error: poll.error ?? "Transcription failed" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ error: "Timeout esperando transcripción" }, { status: 504 });
}
