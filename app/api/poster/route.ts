import { generatePoster } from "@/lib/qwen";

// Allow long Qwen calls. Vercel default is 300s on the Hobby plan.
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
    const seed = typeof body?.seed === "number" ? body.seed : undefined;

    const png = await generatePoster({ prompt, hq, seed });

    return new Response(png, {
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
