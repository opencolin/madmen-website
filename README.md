# madmen.ai — website

Web UI for the Mad Men AI poster generator crew (a deployed CrewAI Enterprise workflow). Enter a brand name, watch eight agents run a 1960s ad brief in sequence, copy the final Gemini Nano Banana prompt.

## What it does

1. User enters a brand name (`client_name`) on the landing page.
2. The Next.js server proxies a `POST /kickoff` to your deployed CrewAI Enterprise endpoint and returns a `kickoff_id`.
3. The browser polls `GET /api/status/:id` every 5 seconds. The server proxies each call to CrewAI.
4. As each of the 8 sequential tasks finishes, its deliverable becomes inspectable (expand the row).
5. When the crew completes, the final 200–350 word Gemini Nano Banana prompt is displayed with a copy button.

The bearer token stays on the server. The browser only ever talks to `/api/*`.

## Setup

```bash
cp .env.local.example .env.local
# fill in CREWAI_ENTERPRISE_URL and CREWAI_ENTERPRISE_TOKEN
pnpm install
pnpm dev
```

Open <http://localhost:3000>.

## Architecture

| Path | Purpose |
|---|---|
| `app/page.tsx` | Landing page: form + "Meet the team" grid (8 agents) |
| `app/run/[id]/page.tsx` | Polling progress: per-task deliverables + final prompt |
| `app/api/kickoff/route.ts` | Server route — proxies to CrewAI `POST /kickoff` |
| `app/api/status/[id]/route.ts` | Server route — proxies to CrewAI `GET /status/:id` |
| `lib/crew.ts` | CrewAI Enterprise client (30s/15s timeouts, token from env) |
| `lib/team.ts` | Agent + task metadata (mirrors `agents.yaml` / `tasks.yaml`) |
| `components/decorations.tsx` | Starburst / Orbit / Planet SVGs |

## Design

Locked in `Atomic Lounge` variant from `/design-shotgun` (May 2026):

| color | hex | usage |
|---|---|---|
| cream | `#F5EFE0` | page background |
| mustard | `#E5B33A` | form card, highlights, key cards |
| teal | `#3A8C8C` | success state, accents |
| coral | `#E76F51` | primary CTA, error state |
| ink | `#1A1A1A` | text, borders, hard shadows |

Fonts: Abril Fatface (display) + DM Sans (body) via `next/font/google`. Hard offset shadows (`shadow-[Npx_Npx_0_0_#1A1A1A]`) give the print-ad feel. Starburst and orbital SVGs are decorative only (`pointer-events-none`, `aria-hidden`).

## Known issues carried over from the upstream crew

- **Joan Holloway is an orphan agent** (defined in `agents.yaml`, never assigned a task). The UI labels her card with a "no task" chip so users see the inconsistency rather than wondering where her output went.
- **Two near-identical "final prompt" tasks** (`create_final_ai_image_generation_prompt` and `final_single_advertisement_prompt`). The UI renders both, but the second is effectively a polish pass.
- **No structured output from the crew** — `tasks_output[i].raw` is freeform prose. The UI renders it in a `<pre>` block.

## Deploy

```bash
vercel
```

Set `CREWAI_ENTERPRISE_URL` and `CREWAI_ENTERPRISE_TOKEN` in Project → Settings → Environment Variables.

Crew runs take 5–10 minutes, but the kickoff route returns immediately. Status polling is sub-second from the browser, so no long-running server work — the default 300s Vercel function timeout is plenty.
