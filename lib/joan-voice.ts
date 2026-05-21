// Joan's voice. Dry, confident, slightly catty about the boys, professional with
// clients. She narrates the entire flow — what's happening, who's doing what,
// what to expect next.

import { TASK_ORDER } from "./team";

type RunPhase =
  | "starting"
  | "running"
  | "success"
  | "rendering_poster"
  | "poster_done"
  | "poster_failed"
  | "failed";

// One Joan line per task. Spoken while THAT task is in progress.
export const JOAN_TASK_LINES: Record<string, string> = {
  client_business_overview_and_requirements:
    "Marketing's giving us the lay of the land. Brand objectives, target audience, budget — the boring stuff first.",
  client_discovery_and_briefing:
    "Pete's running discovery. He's eager — sometimes too eager — but he gets the brief right.",
  mad_men_campaign_analysis:
    "Bob's pulling reference campaigns from the archive. He can recite every Sterling Cooper pitch from memory.",
  ai_prompt_strategy_for_mad_men_style:
    "Don's locked himself in the office. Don't bother him. He'll come out with the strategy when he's good and ready.",
  gemini_nano_banana_pro_prompt_optimization:
    "Engineering's formatting the prompt for the image gen. Don't ask me how — it works.",
  visual_design_specifications_for_client_name_poster:
    "Sal's on the typography and palette. He's the only one in this building with actual taste.",
  create_final_ai_image_generation_prompt:
    "Peggy's drafting the final prompt. She works harder than any of them, and she'll find the emotional hook.",
  final_single_advertisement_prompt:
    "One last polish from engineering. Then I'll show you the campaign myself.",
};

export function joanLineForPhase(opts: {
  phase: RunPhase;
  taskName?: string | null;
  client?: string;
}): string {
  const { phase, taskName, client } = opts;
  switch (phase) {
    case "starting":
      return "Sit tight. The boys are warming up.";
    case "running": {
      // Find the running task (the next one after the most recently completed)
      if (taskName) {
        const idx = TASK_ORDER.indexOf(taskName);
        const next = idx >= 0 && idx + 1 < TASK_ORDER.length ? TASK_ORDER[idx + 1] : null;
        if (next && JOAN_TASK_LINES[next]) return JOAN_TASK_LINES[next];
      }
      // No task done yet — the first one must be running.
      return JOAN_TASK_LINES[TASK_ORDER[0]];
    }
    case "success":
      return `The boys came back with the campaign${
        client ? ` for ${client}` : ""
      }. I'm having the art team print it now.`;
    case "rendering_poster":
      return "Sent the prompt to the art department. Image is on its way — give it a minute.";
    case "poster_done":
      return "There it is. Print it, run it, send it out the door.";
    case "poster_failed":
      return "Art department's having a moment. Hit Regenerate when you're ready to try again.";
    case "failed":
      return "These things happen. Pick a different brand and we'll start over.";
  }
}

// Lines shown elsewhere in the app
export const JOAN_LANDING_GREETING =
  "Welcome to Sterling Cooper. Tell me your brand and I'll put the boys to work.";

export const JOAN_FORM_HINT = "Just the brand name. I'll handle the rest.";
