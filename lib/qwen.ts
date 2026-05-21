// Server-only Qwen-Image-Edit client.
// Takes a prompt + base image, returns PNG bytes.

import fs from "node:fs/promises";
import path from "node:path";

const QWEN_URL = process.env.QWEN_URL ?? "https://wildolga.tail7a71df.ts.net:8443";

export type QwenOptions = {
  prompt: string;
  seed?: number;
  steps?: number;
  hq?: boolean;
};

export async function generatePoster(opts: QwenOptions): Promise<ArrayBuffer> {
  const canvasPath = path.join(process.cwd(), "public", "canvas.png");
  const canvasBytes = await fs.readFile(canvasPath);

  const form = new FormData();
  form.set("prompt", opts.prompt);
  form.append("images", new Blob([new Uint8Array(canvasBytes)], { type: "image/png" }), "canvas.png");
  if (typeof opts.seed === "number") form.set("seed", String(opts.seed));
  form.set("num_inference_steps", String(opts.steps ?? 8));
  if (opts.hq) form.set("hq", "true");

  // HQ takes ~3 minutes; fast mode ~12s. Bump timeout to 4 min to be safe.
  const timeoutMs = opts.hq ? 4 * 60 * 1000 : 90_000;

  const res = await fetch(`${QWEN_URL}/edit`, {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(timeoutMs),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Qwen returned ${res.status}: ${text.slice(0, 200)}`);
  }

  return res.arrayBuffer();
}
