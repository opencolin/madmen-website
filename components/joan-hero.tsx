"use client";

import Image from "next/image";
import { Starburst, Orbit } from "./decorations";

type JoanHeroProps = {
  greeting?: string;
  caption?: string;
};

const DEFAULT_GREETING =
  "Welcome to Sterling Cooper. Tell me your brand and the team will get to work.";

// Stylized animated host (landing page). Joan's portrait gets a slow breathing
// scale, decorative orbital rings spin in opposite directions behind her, a
// coral starburst pulses at her shoulder, and the speech bubble fades up with a
// blinking cursor.
export function JoanHero({ greeting = DEFAULT_GREETING, caption }: JoanHeroProps) {
  return (
    <div className="relative">
      {/* background decorative orbits — counter-rotating */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Orbit className="joan-orbit-1 w-[120%] h-[120%] text-teal opacity-25" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Orbit className="joan-orbit-2 w-[140%] h-[140%] text-mustard opacity-20" />
      </div>

      {/* foreground decoration — pulsing starburst at shoulder */}
      <Starburst className="joan-pulse absolute -bottom-4 -left-6 w-20 h-20 text-coral z-10 pointer-events-none" />
      <Starburst className="joan-spin-slow absolute top-0 right-0 w-12 h-12 text-mustard opacity-70 z-10 pointer-events-none" />

      {/* Joan portrait, breathing */}
      <div className="relative mx-auto w-72 md:w-80 lg:w-96">
        <div className="joan-breathe">
          <Image
            src="/joan.png"
            alt="Stylized illustration of Joan Holloway, VP Client Services"
            width={768}
            height={1024}
            priority
            className="w-full h-auto block"
          />
        </div>
      </div>

      {/* Speech bubble */}
      <div className="joan-rise relative mt-6 mx-auto max-w-md">
        <div className="bg-mustard text-ink p-5 shadow-[6px_6px_0_0_#1A1A1A] relative">
          <p className="text-[10px] uppercase tracking-[0.3em] text-coral mb-2">
            Joan Holloway · VP, Client Services
          </p>
          <p className="font-display text-xl leading-tight">
            &ldquo;{greeting}&rdquo;
            <span className="joan-cursor inline-block w-2 h-5 bg-ink ml-1 align-middle" aria-hidden />
          </p>
          {caption && (
            <p className="mt-3 text-xs uppercase tracking-[0.25em] text-ink/60">{caption}</p>
          )}
          <div
            className="absolute -top-3 left-12 w-0 h-0"
            style={{
              borderLeft: "12px solid transparent",
              borderRight: "12px solid transparent",
              borderBottom: "12px solid #E5B33A",
            }}
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}

// Compact Joan for the /run page header — portrait + speech bubble in a row.
// The greeting changes with crew state so Joan reacts as the run progresses.
export function JoanWatching({ greeting }: { greeting: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="relative w-24 md:w-28 flex-shrink-0">
        <Starburst className="joan-spin-slow absolute -top-1 -right-2 w-7 h-7 text-mustard opacity-70 pointer-events-none z-10" />
        <div className="joan-breathe">
          <Image
            src="/joan.png"
            alt="Joan keeping watch over the crew"
            width={768}
            height={1024}
            className="w-full h-auto block"
          />
        </div>
      </div>
      <div className="joan-rise relative flex-1 bg-mustard text-ink p-4 shadow-[4px_4px_0_0_#1A1A1A] min-w-0">
        <p className="text-[9px] uppercase tracking-[0.3em] text-coral mb-1">
          Joan · VP, Client Services
        </p>
        <p className="font-display text-base md:text-lg leading-tight">
          &ldquo;{greeting}&rdquo;
          <span className="joan-cursor inline-block w-1.5 h-4 bg-ink ml-1 align-middle" aria-hidden />
        </p>
        <div
          className="absolute -left-3 top-6 w-0 h-0"
          style={{
            borderTop: "10px solid transparent",
            borderBottom: "10px solid transparent",
            borderRight: "10px solid #E5B33A",
          }}
          aria-hidden
        />
      </div>
    </div>
  );
}
