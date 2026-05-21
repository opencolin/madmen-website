// Server-only CrewAI Enterprise API client.
// Accepts either the new env names (CREWAI_ENTERPRISE_*) or the legacy MCP_* names
// from the original CrewAI Enterprise MCP server config — whichever the user has set.

const URL_RAW =
  process.env.CREWAI_ENTERPRISE_URL ??
  process.env.MCP_CREWAI_ENTERPRISE_SERVER_URL ??
  "";

const TOKEN =
  process.env.CREWAI_ENTERPRISE_TOKEN ??
  process.env.MCP_CREWAI_ENTERPRISE_BEARER_TOKEN ??
  "";

const BASE = URL_RAW.replace(/\/$/, "");

function assertConfigured() {
  if (!BASE || !TOKEN) {
    throw new Error(
      "CrewAI Enterprise not configured. Set CREWAI_ENTERPRISE_URL and CREWAI_ENTERPRISE_TOKEN in .env.local",
    );
  }
}

export type KickoffResponse = {
  kickoff_id?: string;
  id?: string;
  crew_id?: string;
  [k: string]: unknown;
};

export async function kickoff(inputs: Record<string, unknown>): Promise<KickoffResponse> {
  assertConfigured();
  const res = await fetch(`${BASE}/kickoff`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs }),
    signal: AbortSignal.timeout(30_000),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`kickoff failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as KickoffResponse;
}

export type TaskOutput = {
  description?: string;
  raw?: string;
  agent?: string;
  name?: string;
  expected_output?: string;
  [k: string]: unknown;
};

export type LastStep = {
  action?: string;
  result?: string;
  [k: string]: unknown;
};

export type CrewStatus = {
  state?: string;
  status?: string;
  result?: string | null;
  result_json?: unknown;
  tasks_output?: TaskOutput[];
  last_step?: LastStep | null;
  last_executed_task?: string | null;
  error?: string;
  [k: string]: unknown;
};

export async function getStatus(id: string): Promise<CrewStatus> {
  assertConfigured();
  const res = await fetch(`${BASE}/status/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(15_000),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`status failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as CrewStatus;
}
