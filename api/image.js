// Vercel serverless function — POST /api/image
// Gemini Nano Banana image generation (and edits with reference images).
import { GoogleGenerativeAI } from "@google/generative-ai";

const DEFAULT_IMAGE_MODEL =
  process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-image-preview";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured." });
  }

  try {
    const {
      model,
      prompt,
      aspect = "1:1",
      referenceImages = [],
    } = req.body || {};

    if (!prompt) return res.status(400).json({ error: "prompt is required" });

    const modelId = model || DEFAULT_IMAGE_MODEL;
    const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const imageModel = gemini.getGenerativeModel({
      model: modelId,
      generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
    });

    const parts = [
      {
        text: `${prompt}\n\nIMPORTANT: Output the image with a strict ${aspect} aspect ratio.`,
      },
      ...referenceImages.map((ref) => ({
        inlineData: { mimeType: ref.mimeType, data: ref.base64 },
      })),
    ];

    const result = await imageModel.generateContent({
      contents: [{ role: "user", parts }],
    });

    const candidate = result.response?.candidates?.[0];
    const imgPart = candidate?.content?.parts?.find((p) => p.inlineData);
    if (!imgPart) {
      const textPart = candidate?.content?.parts?.find((p) => p.text)?.text;
      throw new Error(
        textPart
          ? `Gemini returned no image. Message: ${textPart.slice(0, 200)}`
          : "Gemini returned no image."
      );
    }
    const b64 = imgPart.inlineData.data;
    const mimeType = imgPart.inlineData.mimeType || "image/png";
    return res.status(200).json({
      mimeType,
      base64: b64,
      dataUrl: `data:${mimeType};base64,${b64}`,
      model: modelId,
    });
  } catch (err) {
    console.error("[image:gemini]", err);
    return res
      .status(500)
      .json({ error: err.message || "Image generation failed." });
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: "25mb" } },
};
