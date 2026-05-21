"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TEAM } from "@/lib/team";
import { Starburst, Orbit, Planet } from "@/components/decorations";
import { JoanHero } from "@/components/joan-hero";

const COLOR_CLASSES: Record<string, string> = {
  mustard: "bg-mustard text-ink",
  teal: "bg-teal text-cream",
  coral: "bg-coral text-cream",
  cream: "bg-cream text-ink border-2 border-ink",
};

export default function Home() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = name.trim();
    if (!value) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/kickoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs: { client_name: value } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "kickoff failed");
      const id = data.kickoff_id;
      if (!id) throw new Error("no kickoff_id returned from CrewAI");
      router.push(`/run/${id}?client=${encodeURIComponent(value)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "kickoff failed");
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Starburst className="absolute top-12 right-24 w-32 h-32 text-mustard opacity-80 pointer-events-none" />
      <Orbit className="absolute top-56 left-8 w-24 h-24 text-teal opacity-60 pointer-events-none" />
      <Planet className="absolute bottom-32 right-12 w-20 h-20 text-coral opacity-70 pointer-events-none" />
      <Starburst className="absolute top-2/3 left-1/4 w-16 h-16 text-coral opacity-50 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 relative z-10">
        <header className="flex items-center justify-between mb-14">
          <div className="relative inline-flex items-center">
            <Starburst className="absolute -left-5 -top-2 w-14 h-14 text-coral" />
            <h1 className="relative font-display text-3xl md:text-4xl tracking-wide text-ink">
              MADMEN.AI
            </h1>
          </div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-teal hidden md:inline">
            Sterling Cooper · Est. 2026
          </span>
        </header>

        <section className="mb-12 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-coral mb-4">
            NOW with COMPUTER POWER!
          </p>
          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.02] mb-6 text-balance">
            Generate a 1960s ad poster for any brand.
          </h2>
          <p className="text-lg leading-relaxed text-ink/70 max-w-2xl">
            Eight AI agents modeled on Sterling Cooper run a full creative brief,
            then hand you a Gemini-ready image prompt. Joan will brief you in.
          </p>
        </section>

        <section className="grid md:grid-cols-[1fr_1fr] lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 mb-24 items-start">
          <JoanHero />

          <form onSubmit={onSubmit} className="bg-mustard p-8 md:p-10 relative shadow-[8px_8px_0_0_#1A1A1A] md:mt-8">
            <Orbit className="absolute -top-8 -right-8 w-20 h-20 text-ink opacity-25 pointer-events-none" />
            <label
              htmlFor="brand"
              className="block text-xs uppercase tracking-[0.3em] mb-3 text-ink/80"
            >
              Your brand
            </label>
            <input
              id="brand"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Heinz, Lucky Strike, Pan Am…"
              className="w-full bg-cream border-2 border-ink px-4 py-4 text-xl mb-4 font-display tracking-wide focus:outline-none focus:border-coral placeholder:text-ink/30"
              disabled={loading}
              autoFocus
              maxLength={80}
            />
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full bg-coral text-cream font-bold uppercase tracking-[0.25em] px-6 py-4 text-lg disabled:opacity-40 hover:bg-ink transition-colors"
            >
              {loading ? "Kicking off…" : "Generate!"}
            </button>
            {error && (
              <p className="mt-4 text-sm text-coral bg-cream px-3 py-2 border-2 border-coral">
                {error}
              </p>
            )}
            <p className="mt-4 text-[10px] uppercase tracking-widest text-ink/50">
              Runs ~5–10 minutes · sequential eight-agent crew
            </p>
          </form>
        </section>

        <section>
          <div className="flex items-baseline gap-4 mb-8 flex-wrap">
            <h3 className="font-display text-4xl md:text-5xl">The crew Joan keeps in line</h3>
            <span className="text-[10px] uppercase tracking-[0.3em] text-ink/50">
              8 specialists, sequential brief
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEAM.filter((a) => !a.isHost).map((agent) => (
              <article
                key={agent.id}
                className={`p-5 relative ${COLOR_CLASSES[agent.color]} shadow-[4px_4px_0_0_#1A1A1A]`}
              >
                <p className="font-display text-2xl leading-tight mb-1">{agent.name}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] mb-3 opacity-75">
                  {agent.role}
                </p>
                <p className="text-sm leading-snug">{agent.bio}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="mt-20 pt-8 border-t-2 border-ink/20 text-[10px] uppercase tracking-[0.3em] text-ink/50 flex justify-between flex-wrap gap-4">
          <span>Madmen.ai · powered by CrewAI Enterprise</span>
          <span>Output: Gemini Nano Banana prompt</span>
        </footer>
      </div>
    </main>
  );
}
