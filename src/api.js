// Thin client for the Saucemed backend.
// All AI calls go through these helpers — no keys ever touch the browser.

const BASE = ""; // proxied via Vite to http://localhost:8787

async function postJson(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

/**
 * Generate text via any of the three engines.
 */
export async function generateText({
  engine,
  prompt,
  system,
  schema,
  temperature,
  maxTokens,
}) {
  return postJson("/api/text", {
    engine,
    prompt,
    system,
    schema,
    temperature,
    maxTokens,
  });
}

/**
 * Generate an image. Pick provider via `engine` ("openai" or "gemini").
 * Optionally override the specific model id.
 */
export async function generateImage({
  engine = "openai",
  model, // optional explicit model id (e.g. "gemini-3-pro-image-preview")
  prompt,
  aspect = "1:1",
  quality = "high",
  referenceImages = [],
}) {
  return postJson("/api/image", {
    engine,
    model,
    prompt,
    aspect,
    quality,
    referenceImages,
  });
}

export async function checkHealth() {
  const res = await fetch(`${BASE}/api/health`);
  return res.json();
}
