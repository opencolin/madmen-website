import { generatePoster } from "@/lib/imagegen";

// Vercel default timeout is 300s as of late 2025. Gemini Nano Banana usually
// returns in ~5-15s; Nano Banana Pro can take 30-90s. 300s is plenty.
export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const prompt: unknown = body?.prompt;
    if (typeof prompt !== "string" || prompt.trim().length < 30) {
      return Response.json(
        { error: "prompt (string, at least 30 chars) is required" },
        { status: 400 },
      );
    }
    const hq = Boolean(body?.hq);

    const png = await generatePoster({ prompt, hq });

    // Wrap in a Blob to satisfy the BodyInit typing across Node fetch +
    // TypeScript 5.6's tighter Uint8Array generic. Same wire format.
    return new Response(new Blob([new Uint8Array(png)], { type: "image/png" }), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "poster generation failed";
    return Response.json({ error: message }, { status: 502 });
  }
}
