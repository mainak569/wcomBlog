import { NextResponse } from "next/server";

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    if (!question?.trim()) {
      return NextResponse.json({ error: "A question is required." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key missing" }, { status: 500 });
    }

    const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: question }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 8000 },
      }),
    });

    const data = await response.json();

    console.log("Gemini response:", data); // 🔍 DEBUG

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || "Gemini error" },
        { status: response.status }
      );
    }

    // ---- ANSWER EXTRACTION FIX ----
    let answer: string | null = null;

    // 1️⃣ New Gemini 2.5 format
    if (data.text) {
      answer = data.text;
    }

    // 2️⃣ Existing "candidates" format
    if (!answer && data?.candidates?.[0]?.content?.parts) {
      answer = data.candidates[0].content.parts
        .map((p: any) => p.text || "")
        .join("\n")
        .trim();
    }

    return NextResponse.json({
      answer: answer || "I couldn't find an answer.",
    });
  } catch (err) {
    console.error("Gemini route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
