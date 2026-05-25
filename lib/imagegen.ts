// Server-only image generation via the Vercel AI Gateway.
// Targets Google's Gemini Nano Banana (gemini-2.5-flash-image, fast) and
// Nano Banana Pro (gemini-3-pro-image-preview, HQ).
//
// Gemini's image generation is part of the multimodal Gemini family — the
// gateway classifies these models as "language" models so we use `generateText`
// with `responseModalities` set to include IMAGE, then pull the image out of
// the returned `files` array.
//
// Auth:
//   Local dev — set AI_GATEWAY_API_KEY in .env.local
//   Vercel    — signed OIDC handshake handles it automatically when the
//               project is linked. No env var required in prod.

import { generateText } from "ai";

export type ImagegenOptions = {
  prompt: string;
  hq?: boolean;
};

const MODEL_FAST = "google/gemini-2.5-flash-image";
const MODEL_HQ = "google/gemini-3-pro-image-preview";

export async function generatePoster(opts: ImagegenOptions): Promise<Uint8Array> {
  const model = opts.hq ? MODEL_HQ : MODEL_FAST;

  const result = await generateText({
    model,
    prompt: opts.prompt,
    providerOptions: {
      google: {
        responseModalities: ["IMAGE", "TEXT"],
      },
    },
  });

  // Find the first image file in the response. Gemini returns the rendered
  // image inline alongside any descriptive text it generates.
  const imageFile = result.files?.find((f) =>
    typeof f.mediaType === "string" && f.mediaType.startsWith("image/"),
  );

  if (!imageFile) {
    const textPreview = (result.text ?? "").slice(0, 300);
    throw new Error(
      `Gemini did not return an image. Response text: ${textPreview || "(empty)"}`,
    );
  }

  return imageFile.uint8Array;
}
