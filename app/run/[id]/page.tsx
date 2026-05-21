"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { TASK_ORDER, TASKS, TEAM, type AgentColor } from "@/lib/team";
import { Starburst } from "@/components/decorations";

type TaskOutput = {
  description?: string;
  raw?: string;
  agent?: string;
  name?: string;
};

type Status = {
  state?: string;
  status?: string;
  result?: string | null;
  tasks_output?: TaskOutput[];
  error?: string;
};

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
  const lastDoneIdx = (status?.tasks_output?.length ?? 0) - 1;

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

        {isDone && status?.result && (
          <section className="mb-12 bg-teal text-cream p-8 shadow-[8px_8px_0_0_#1A1A1A]">
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
