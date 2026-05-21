"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TEAM } from "@/lib/team";
import { Starburst, Orbit, Planet } from "@/components/decorations";
import { JoanHero } from "@/components/joan-hero";
import { JOAN_LANDING_GREETING, JOAN_FORM_HINT } from "@/lib/joan-voice";
import {
  listPortfolioEntries,
  subscribePortfolio,
  type PortfolioEntry,
} from "@/lib/portfolio";

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
  const [recent, setRecent] = useState<PortfolioEntry[]>([]);
  const router = useRouter();

  // Show the 4 most recent campaigns from the portfolio above the team grid.
  useEffect(() => {
    setRecent(listPortfolioEntries().slice(0, 4));
    const unsub = subscribePortfolio(() => {
      setRecent(listPortfolioEntries().slice(0, 4));
    });
    return unsub;
  }, []);

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
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/portfolio"
              className="text-[10px] uppercase tracking-[0.3em] text-coral hover:text-ink"
            >
              Portfolio
            </Link>
            <span className="text-[10px] uppercase tracking-[0.3em] text-teal">
              Sterling Cooper · Est. 2026
            </span>
          </div>
        </header>

        <section className="mb-12 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-coral mb-4">
            NOW with COMPUTER POWER!
          </p>
          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.02] mb-6 text-balance">
            Generate a 1960s ad poster for any brand.
          </h2>
          <p className="text-lg leading-relaxed text-ink/70 max-w-2xl">
            Madison Avenue, 1962. Tell Joan your brand. The creative floor
            drafts the campaign and she walks the poster to your office by
            close of business.
          </p>
        </section>

        <section className="grid md:grid-cols-[1fr_1fr] lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 mb-24 items-start">
          <JoanHero greeting={JOAN_LANDING_GREETING} caption={JOAN_FORM_HINT} />

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
              {loading ? "Joan's on it…" : "Tell Joan"}
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

        {recent.length > 0 && (
          <section className="mb-20">
            <div className="flex items-baseline justify-between gap-4 mb-6 flex-wrap">
              <div className="flex items-baseline gap-4 flex-wrap">
                <h3 className="font-display text-4xl md:text-5xl">Joan&apos;s recent campaigns</h3>
                <span className="text-[10px] uppercase tracking-[0.3em] text-ink/50">
                  newest first · saved in this browser
                </span>
              </div>
              <Link
                href="/portfolio"
                className="text-xs uppercase tracking-[0.3em] text-coral hover:text-ink"
              >
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recent.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/run/${entry.id}?client=${encodeURIComponent(entry.client)}`}
                  className="group block bg-cream border-2 border-ink shadow-[4px_4px_0_0_#1A1A1A] hover:shadow-[8px_8px_0_0_#1A1A1A] hover:-translate-x-1 hover:-translate-y-1 transition-all"
                >
                  <div className="relative aspect-square bg-sand overflow-hidden">
                    {entry.imageDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={entry.imageDataUrl}
                        alt={`Mad Men style poster for ${entry.client}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-ink/40">
                        <Starburst className="w-10 h-10 text-mustard mb-1" />
                        <span className="text-[9px] uppercase tracking-[0.25em]">
                          rendering…
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 border-t-2 border-ink">
                    <p className="font-display text-lg leading-tight truncate">{entry.client}</p>
                    <p className="text-[9px] uppercase tracking-[0.25em] text-ink/60 mt-1">
                      {new Date(entry.updatedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

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
