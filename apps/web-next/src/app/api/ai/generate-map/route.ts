import { NextResponse } from "next/server";

const MODEL = "gemini-2.0-flash-exp-image-generation";

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY não configurada no servidor" },
      { status: 500 },
    );
  }

  const body = await req.json();
  const { prompt, widthPx, heightPx } = body as {
    prompt: string;
    widthPx: number;
    heightPx: number;
  };

  if (!prompt || typeof prompt !== "string" || prompt.trim().length < 10) {
    return NextResponse.json({ error: "Prompt é obrigatório (min 10 chars)" }, { status: 400 });
  }
  if (!widthPx || !heightPx || widthPx > 2048 || heightPx > 2048) {
    return NextResponse.json({ error: "Dimensões inválidas (máx 2048px)" }, { status: 400 });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseModalities: ["IMAGE", "TEXT"],
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[AI Map] Gemini error:", data);
      return NextResponse.json({ error: "Falha ao gerar imagem via Gemini" }, { status: 502 });
    }

    const imagePart = data.candidates?.[0]?.content?.parts?.find(
      (p: { inlineData?: { data: string; mimeType: string } }) => p.inlineData,
    );

    if (!imagePart?.inlineData?.data) {
      return NextResponse.json({ error: "Gemini não retornou imagem" }, { status: 502 });
    }

    return NextResponse.json({
      imageBase64: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType ?? "image/jpeg",
    });
  } catch (err) {
    console.error("[AI Map] Error:", err);
    return NextResponse.json({ error: "Erro interno ao gerar mapa" }, { status: 500 });
  }
}
