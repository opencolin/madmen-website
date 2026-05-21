"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  listPortfolioEntries,
  deletePortfolioEntry,
  subscribePortfolio,
  type PortfolioEntry,
} from "@/lib/portfolio";
import { Starburst, Orbit } from "@/components/decorations";

export default function PortfolioPage() {
  const [entries, setEntries] = useState<PortfolioEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setEntries(listPortfolioEntries());
    setMounted(true);
    const unsub = subscribePortfolio(() => setEntries(listPortfolioEntries()));
    return unsub;
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Starburst className="absolute top-12 right-24 w-32 h-32 text-mustard opacity-80 pointer-events-none" />
      <Orbit className="absolute top-72 left-8 w-24 h-24 text-teal opacity-50 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 relative z-10">
        <Link
          href="/"
          className="inline-block text-xs uppercase tracking-[0.3em] text-coral hover:text-ink"
        >
          ← Sterling Cooper
        </Link>

        <header className="mt-6 mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-coral mb-3">The portfolio</p>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.02] mb-4">
            Every campaign Joan has signed off.
          </h1>
          <p className="text-lg leading-relaxed text-ink/70 max-w-2xl">
            Saved to this browser. Newest first. Click a card to reopen the run.
          </p>
        </header>

        {!mounted && (
          <p className="text-sm uppercase tracking-[0.25em] text-ink/40">Opening the archive…</p>
        )}

        {mounted && entries.length === 0 && (
          <div className="bg-mustard p-8 max-w-2xl shadow-[6px_6px_0_0_#1A1A1A]">
            <p className="font-display text-3xl mb-3">No campaigns on file yet.</p>
            <p className="text-sm leading-relaxed mb-5">
              Run your first brand from the landing page and Joan will file it here automatically.
            </p>
            <Link
              href="/"
              className="inline-block bg-coral text-cream font-bold uppercase tracking-[0.25em] px-5 py-3 text-sm hover:bg-ink transition-colors"
            >
              Pitch a brand
            </Link>
          </div>
        )}

        {mounted && entries.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((entry) => (
              <PortfolioCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}

        <footer className="mt-20 pt-8 border-t-2 border-ink/20 text-[10px] uppercase tracking-[0.3em] text-ink/50 flex justify-between flex-wrap gap-4">
          <span>Stored in this browser · clears on hard reset</span>
          <span>Madmen.ai · the Joan Holloway archive</span>
        </footer>
      </div>
    </main>
  );
}

function PortfolioCard({ entry }: { entry: PortfolioEntry }) {
  function onDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Remove "${entry.client}" from the portfolio?`)) {
      deletePortfolioEntry(entry.id);
    }
  }

  const date = new Date(entry.updatedAt);
  const dateLabel = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      href={`/run/${entry.id}?client=${encodeURIComponent(entry.client)}`}
      className="group block bg-cream border-2 border-ink shadow-[6px_6px_0_0_#1A1A1A] hover:shadow-[10px_10px_0_0_#1A1A1A] hover:-translate-x-1 hover:-translate-y-1 transition-all"
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
            <Starburst className="w-12 h-12 text-mustard mb-2" />
            <span className="text-[10px] uppercase tracking-[0.3em]">Prompt only · no render</span>
          </div>
        )}
        <button
          type="button"
          onClick={onDelete}
          className="absolute top-2 right-2 bg-ink text-cream uppercase tracking-[0.2em] text-[9px] font-bold px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-coral"
          aria-label={`Remove ${entry.client}`}
        >
          Remove
        </button>
      </div>
      <div className="p-5 border-t-2 border-ink">
        <p className="font-display text-2xl leading-tight mb-1 truncate">{entry.client}</p>
        <p className="text-[10px] uppercase tracking-[0.25em] text-ink/60 mb-3">{dateLabel}</p>
        <p className="text-sm text-ink/70 line-clamp-3 leading-snug">
          {entry.prompt.slice(0, 180)}
          {entry.prompt.length > 180 && "…"}
        </p>
      </div>
    </Link>
  );
}
