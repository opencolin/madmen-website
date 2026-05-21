import { NextResponse } from "next/server";
import { kickoff } from "@/lib/crew";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const inputs = body?.inputs ?? {};
    if (!inputs.client_name || typeof inputs.client_name !== "string") {
      return NextResponse.json(
        { error: "client_name (string) is required in inputs" },
        { status: 400 },
      );
    }
    const result = await kickoff(inputs);
    // Normalize the response so the client can rely on kickoff_id regardless of
    // which key the upstream returns.
    const id = result.kickoff_id ?? result.id ?? result.crew_id ?? null;
    return NextResponse.json({ ...result, kickoff_id: id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "kickoff failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
