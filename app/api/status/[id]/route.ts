import { NextResponse } from "next/server";
import { getStatus } from "@/lib/crew";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    const status = await getStatus(id);
    return NextResponse.json(status);
  } catch (err) {
    const message = err instanceof Error ? err.message : "status failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
