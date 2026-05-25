// Server-only image generation via the Vercel AI Gateway.
// Targets Google's Gemini Nano Banana (gemini-2.5-flash-image, fast) and
// Nano Banana Pro (gemini-3-pro-image-preview, HQ). The "provider/model"
// string shape lets the AI Gateway route the call — no direct provider
// package needed.
//
// Auth:
//   Local dev — set AI_GATEWAY_API_KEY in .env.local
//   Vercel    — signed OIDC handshake handles it automatically when the
//               project is linked. No env var required in prod.

import { generateImage } from "ai";

export type ImagegenOptions = {
  prompt: string;
  hq?: boolean;
};

const MODEL_FAST = "google/gemini-2.5-flash-image";
const MODEL_HQ = "google/gemini-3-pro-image-preview";

export async function generatePoster(opts: ImagegenOptions): Promise<Uint8Array> {
  const model = opts.hq ? MODEL_HQ : MODEL_FAST;
  const result = await generateImage({
    model,
    prompt: opts.prompt,
    aspectRatio: "1:1",
  });
  return result.image.uint8Array;
}
