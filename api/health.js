// Vercel serverless function — GET /api/health
export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    gemini: Boolean(process.env.GEMINI_API_KEY),
    textModel: process.env.GEMINI_TEXT_MODEL || "gemini-3-flash-preview",
    imageModel:
      process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-image-preview",
  });
}
