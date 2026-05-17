// Vercel serverless function — POST /api/text
// Gemini text generation only.
import { GoogleGenerativeAI } from "@google/generative-ai";

const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || "gemini-3-flash-preview";

const stripCodeFences = (s) =>
  String(s || "")
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

const parseJsonLoose = (raw) => {
  const cleaned = stripCodeFences(raw);
  try {
    return JSON.parse(cleaned);
  } catch {
    const m = cleaned.match(/[{\[][\s\S]*[}\]]/);
    if (m) return JSON.parse(m[0]);
    throw new Error("Could not parse JSON from model output.");
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured." });
  }

  try {
    const {
      prompt,
      system,
      schema,
      temperature = 0.8,
      maxTokens = 2048,
    } = req.body || {};

    if (!prompt) return res.status(400).json({ error: "prompt is required" });

    const wantJson = Boolean(schema);
    const sys =
      system ||
      (wantJson
        ? "You are a precise assistant. Always respond with valid JSON only — no markdown, no commentary. Match the requested JSON shape EXACTLY, including every field name, nesting, and array structure shown."
        : "You are a thoughtful, concise assistant.");

    // When a schema is provided, append it to the prompt so the model knows
    // the exact keys, types, and structure to produce. Without this the
    // schema is effectively discarded and the model invents its own keys.
    const finalPrompt = wantJson
      ? `${prompt}

Respond with STRICT JSON matching exactly this shape — use these EXACT field names and structure, no extras, no renames:

${JSON.stringify(schema, null, 2)}

Where a value is written as "string", produce a string. Where an array of objects is shown, produce that array with each object having those exact keys. Do not wrap the response in any other object.`
      : prompt;

    const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = gemini.getGenerativeModel({
      model: TEXT_MODEL,
      systemInstruction: sys,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        ...(wantJson ? { responseMimeType: "application/json" } : {}),
      },
    });

    const result = await model.generateContent(finalPrompt);
    const text = result.response.text();

    if (wantJson) {
      try {
        const json = parseJsonLoose(text);
        return res.status(200).json({ text, json });
      } catch {
        return res
          .status(502)
          .json({ error: "Model did not return valid JSON.", raw: text });
      }
    }
    return res.status(200).json({ text });
  } catch (err) {
    console.error("[text:gemini]", err);
    return res
      .status(500)
      .json({ error: err.message || "Text generation failed." });
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: "10mb" } },
};
