"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { TASK_ORDER, TASKS, TEAM, type AgentColor } from "@/lib/team";
import { Starburst } from "@/components/decorations";

type TaskOutput = {
  description?: string;
  raw?: string;
  agent?: string;
  name?: string;
};

type LastStep = {
  action?: string;
  result?: string;
};

type Status = {
  state?: string;
  status?: string;
  result?: string | null;
  tasks_output?: TaskOutput[];
  last_step?: LastStep | null;
  last_executed_task?: string | null;
  error?: string;
};

type ParsedLastStep = {
  thought: string;
  action: string;
  actionInput: string;
  toolResult: string;
};

function parseLastStep(step: LastStep): ParsedLastStep {
  const text = step.action ?? "";
  const thoughtMatch = text.match(/Thought:\s*([\s\S]*?)(?=\n(?:Action|Action Input|Final Answer)\s*:|$)/);
  const actionMatch = text.match(/Action:\s*([\s\S]*?)(?=\n(?:Action Input|Thought|Final Answer)\s*:|$)/);
  const actionInputMatch = text.match(/Action Input:\s*([\s\S]*?)(?=\n(?:Thought|Action|Observation|Final Answer)\s*:|$)/);
  return {
    thought: thoughtMatch?.[1]?.trim() ?? "",
    action: actionMatch?.[1]?.trim() ?? "",
    actionInput: actionInputMatch?.[1]?.trim() ?? "",
    toolResult: step.result?.trim() ?? "",
  };
}

const COLOR_CHIP: Record<AgentColor, string> = {
  mustard: "bg-mustard text-ink",
  teal: "bg-teal text-cream",
  coral: "bg-coral text-cream",
  cream: "bg-cream text-ink border-2 border-ink",
};

function getState(s: Status | null): string {
  return String(s?.state ?? s?.status ?? "RUNNING").toUpperCase();
}

export default function Run({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ client?: string }>;
}) {
  const { id } = use(params);
  const { client } = use(searchParams);
  const [status, setStatus] = useState<Status | null>(null);
  const [pollError, setPollError] = useState<string | null>(null);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function tick() {
      try {
        const res = await fetch(`/api/status/${id}`, { cache: "no-store" });
        const data = (await res.json()) as Status;
        if (!alive) return;
        if (!res.ok) throw new Error(data.error ?? "status failed");
        setStatus(data);
        setPollError(null);
        const state = getState(data);
        const done = ["SUCCESS", "COMPLETED", "FAILED", "ERROR"].includes(state);
        if (!done) timer = setTimeout(tick, 5000);
      } catch (err) {
        if (!alive) return;
        setPollError(err instanceof Error ? err.message : "polling failed");
        timer = setTimeout(tick, 10_000);
      }
    }

    tick();
    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
    };
  }, [id]);

  const state = getState(status);
  const isDone = ["SUCCESS", "COMPLETED"].includes(state);
  const isFailed = ["FAILED", "ERROR"].includes(state);

  // Use last_executed_task as the most reliable progress indicator while the
  // crew is running. Fall back to tasks_output.length once the crew completes.
  const lastExecutedIdx = status?.last_executed_task
    ? TASK_ORDER.indexOf(status.last_executed_task)
    : -1;
  const lastDoneIdx = Math.max(
    lastExecutedIdx,
    (status?.tasks_output?.length ?? 0) - 1,
  );
  const parsedStep =
    status?.last_step && !isDone && !isFailed ? parseLastStep(status.last_step) : null;
  const runningAgent =
    !isDone && !isFailed && lastDoneIdx + 1 < TASK_ORDER.length
      ? (() => {
          const taskId = TASK_ORDER[lastDoneIdx + 1];
          const task = TASKS[taskId];
          return task ? TEAM.find((a) => a.id === task.agentId) : undefined;
        })()
      : undefined;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Starburst className="absolute top-12 right-16 w-24 h-24 text-mustard opacity-60 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 md:px-12 py-10 relative z-10">
        <Link
          href="/"
          className="inline-block text-xs uppercase tracking-[0.3em] text-coral hover:text-ink"
        >
          ← New campaign
        </Link>

        <header className="mt-4 mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-coral mb-2">In production</p>
          <h1 className="font-display text-5xl md:text-6xl leading-[1.05]">
            Sterling Cooper is working on{" "}
            <span className="bg-mustard px-3 inline-block">{client ?? "your brand"}</span>
          </h1>
          <p className="mt-4 text-xs uppercase tracking-[0.25em] text-ink/60">
            Job {id.slice(0, 12)}… · status:{" "}
            <span
              className={
                isDone
                  ? "text-teal font-bold"
                  : isFailed
                  ? "text-coral font-bold"
                  : "text-ink font-bold"
              }
            >
              {state}
            </span>
          </p>
        </header>

        {pollError && (
          <div className="bg-coral text-cream p-4 mb-8 text-sm">
            Polling error: {pollError}. Retrying…
          </div>
        )}

        {parsedStep && (
          <section className="mb-8 bg-cream border-2 border-ink p-6 shadow-[4px_4px_0_0_#1A1A1A]">
            <div className="flex items-baseline justify-between gap-4 mb-4 flex-wrap">
              <p className="text-xs uppercase tracking-[0.3em] text-coral">
                Live agent thinking
              </p>
              {runningAgent && (
                <span className="text-[10px] uppercase tracking-[0.25em] text-ink/60">
                  {runningAgent.name} · {runningAgent.role}
                </span>
              )}
            </div>
            {parsedStep.thought && (
              <div className="mb-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-ink/60 mb-1">
                  Thought
                </p>
                <pre className="whitespace-pre-wrap font-body text-sm leading-relaxed">
                  {parsedStep.thought}
                </pre>
              </div>
            )}
            {parsedStep.action && (
              <div className="mb-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-ink/60 mb-1">
                  Action
                </p>
                <pre className="whitespace-pre-wrap font-body text-sm leading-relaxed bg-sand px-3 py-2">
                  {parsedStep.action}
                </pre>
              </div>
            )}
            {parsedStep.actionInput && (
              <div className="mb-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-ink/60 mb-1">
                  Action input
                </p>
                <pre className="whitespace-pre-wrap font-body text-sm leading-relaxed bg-sand px-3 py-2 max-h-32 overflow-y-auto">
                  {parsedStep.actionInput}
                </pre>
              </div>
            )}
            {parsedStep.toolResult && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-ink/60 mb-1">
                  Tool result (latest)
                </p>
                <pre className="whitespace-pre-wrap font-body text-sm leading-relaxed bg-sand px-3 py-2 max-h-48 overflow-y-auto">
                  {parsedStep.toolResult}
                </pre>
              </div>
            )}
          </section>
        )}

        {isDone && status?.result && (
          <>
            <section className="mb-8 bg-teal text-cream p-8 shadow-[8px_8px_0_0_#1A1A1A]">
              <p className="text-xs uppercase tracking-[0.3em] mb-2 opacity-80">
                Final Gemini-ready prompt
              </p>
              <h2 className="font-display text-3xl mb-4">
                Hand this to Gemini Nano Banana Pro
              </h2>
              <pre className="bg-cream text-ink p-6 whitespace-pre-wrap font-body text-base leading-relaxed">
                {status.result}
              </pre>
              <CopyButton text={status.result} />
            </section>
            <PosterGenerator prompt={status.result} client={client ?? "campaign"} />
          </>
        )}

        {isFailed && (
          <section className="mb-12 bg-coral text-cream p-8 shadow-[8px_8px_0_0_#1A1A1A]">
            <h2 className="font-display text-3xl mb-3">Pitch died on the page.</h2>
            <p className="text-sm">
              {status?.error ??
                "The crew returned an error. Try a different brand name and run again."}
            </p>
          </section>
        )}

        <section>
          <h2 className="font-display text-4xl mb-6">Deliverables</h2>
          <ol className="space-y-3">
            {TASK_ORDER.map((taskId, idx) => {
              const task = TASKS[taskId];
              const agent = TEAM.find((a) => a.id === task.agentId);
              const taskOutput = status?.tasks_output?.[idx];
              const taskState: "done" | "running" | "pending" | "skipped" = taskOutput
                ? "done"
                : idx === lastDoneIdx + 1 && !isDone && !isFailed
                ? "running"
                : isFailed
                ? "skipped"
                : "pending";
              const open = expandedTask === taskId;

              return (
                <li key={taskId} className="border-2 border-ink bg-cream">
                  <button
                    type="button"
                    onClick={() => setExpandedTask(open ? null : taskId)}
                    className="w-full text-left p-5 flex items-center gap-4 hover:bg-mustard/30 transition-colors"
                  >
                    <span
                      className={`w-4 h-4 flex-shrink-0 ${
                        taskState === "done"
                          ? "bg-teal"
                          : taskState === "running"
                          ? "bg-mustard animate-pulse"
                          : taskState === "skipped"
                          ? "bg-ink/30"
                          : "bg-cream border-2 border-ink"
                      }`}
                      aria-hidden
                    />
                    <span className="text-xs uppercase tracking-[0.25em] text-ink/50 w-8">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-xl leading-tight">{task.title}</p>
                      {agent && (
                        <p className="text-[10px] uppercase tracking-[0.25em] text-ink/60 mt-1">
                          {agent.name} · {agent.role}
                        </p>
                      )}
                    </div>
                    {agent && (
                      <span
                        className={`hidden md:inline text-[9px] uppercase tracking-widest px-2 py-1 ${COLOR_CHIP[agent.color]}`}
                      >
                        {agent.name}
                      </span>
                    )}
                    <span className="text-xs uppercase tracking-[0.25em] text-coral whitespace-nowrap">
                      {taskState === "done"
                        ? "delivered"
                        : taskState === "running"
                        ? "writing…"
                        : taskState === "skipped"
                        ? "skipped"
                        : "pending"}
                    </span>
                  </button>
                  {open && (
                    <div className="border-t-2 border-ink p-5">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-ink/60 mb-1">
                        Expected deliverable
                      </p>
                      <p className="text-sm mb-4 italic">{task.deliverable}</p>
                      {taskOutput?.raw ? (
                        <>
                          <p className="text-[10px] uppercase tracking-[0.25em] text-ink/60 mb-1">
                            {agent?.name ?? task.agentId}&apos;s output
                          </p>
                          <pre className="bg-sand border border-ink/20 p-4 whitespace-pre-wrap text-sm leading-relaxed font-body max-h-[600px] overflow-y-auto">
                            {taskOutput.raw}
                          </pre>
                        </>
                      ) : (
                        <p className="text-sm text-ink/50">
                          No output yet. The crew is working sequentially — this task starts after the previous one finishes.
                        </p>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        <footer className="mt-20 pt-8 border-t-2 border-ink/20 text-[10px] uppercase tracking-[0.3em] text-ink/50">
          Madmen.ai · powered by CrewAI Enterprise · polling every 5s
        </footer>
      </div>
    </main>
  );
}

function PosterGenerator({ prompt, client }: { prompt: string; client: string }) {
  const [state, setState] = useState<"idle" | "generating" | "done" | "error">("idle");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hq, setHq] = useState(false);
  const autoStartedRef = useRef(false);
  const inFlightRef = useRef(false);

  async function generate(useHq: boolean) {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setState("generating");
    setError(null);
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
      setImageUrl(null);
    }
    try {
      const res = await fetch("/api/poster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, hq: useHq }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Qwen returned ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "poster generation failed");
      setState("error");
    } finally {
      inFlightRef.current = false;
    }
  }

  // Auto-render the poster the moment the crew finishes. One-shot per prompt;
  // user can re-trigger via the Regenerate button (which respects the HQ toggle).
  useEffect(() => {
    if (autoStartedRef.current) return;
    if (!prompt || prompt.trim().length < 30) return;
    autoStartedRef.current = true;
    void generate(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt]);

  const safeName =
    client.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "campaign";

  const isGenerating = state === "generating";
  const sectionTitle =
    state === "done"
      ? "Your 1960s ad poster"
      : state === "error"
      ? "Render failed — try again"
      : "Rendering your poster…";

  return (
    <section className="mb-12 bg-coral text-cream p-8 shadow-[8px_8px_0_0_#1A1A1A]">
      <p className="text-xs uppercase tracking-[0.3em] mb-2 opacity-80">
        {state === "done" ? "Direct from Qwen-Image-Edit" : "Auto-rendering with Qwen-Image-Edit"}
      </p>
      <h2 className="font-display text-3xl mb-4">{sectionTitle}</h2>

      {isGenerating && (
        <div className="bg-cream text-ink p-6 mb-6 flex items-center gap-4">
          <span className="w-3 h-3 bg-coral animate-pulse" aria-hidden />
          <p className="text-sm">
            {hq
              ? "HQ render in progress — full 40-step sampler, ~3 minutes."
              : "Fast render in progress — ~15–60 seconds."}
          </p>
        </div>
      )}

      {error && (
        <div className="bg-cream text-coral border-2 border-cream p-4 text-sm mb-4">
          {error}
        </div>
      )}

      {imageUrl && state === "done" && (
        <div className="bg-cream p-4 mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={`Generated 1960s Mad Men style poster for ${client}`}
            className="w-full max-w-2xl mx-auto block"
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        {(state === "done" || state === "error") && (
          <button
            type="button"
            onClick={() => generate(hq)}
            disabled={isGenerating}
            className="bg-cream text-ink font-bold uppercase tracking-[0.25em] px-6 py-3 text-sm disabled:opacity-50 hover:bg-mustard transition-colors"
          >
            {hq ? "Regenerate in HQ" : "Regenerate"}
          </button>
        )}
        {imageUrl && state === "done" && (
          <a
            href={imageUrl}
            download={`madmen-${safeName}.png`}
            className="bg-ink text-cream uppercase tracking-[0.25em] text-xs font-bold px-4 py-3 hover:bg-mustard hover:text-ink transition-colors"
          >
            Download PNG
          </a>
        )}
        <label className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] cursor-pointer ml-auto">
          <input
            type="checkbox"
            checked={hq}
            onChange={(e) => setHq(e.target.checked)}
            disabled={isGenerating}
            className="w-4 h-4 accent-mustard"
          />
          HQ mode (~3 min)
        </label>
      </div>
    </section>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // ignore
        }
      }}
      className="mt-4 bg-cream text-ink uppercase tracking-[0.25em] text-xs font-bold px-4 py-2 hover:bg-mustard transition-colors"
    >
      {copied ? "Copied!" : "Copy prompt"}
    </button>
  );
}
