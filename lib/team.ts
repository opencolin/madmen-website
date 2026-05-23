export type AgentColor = "mustard" | "teal" | "coral" | "cream";

export type Agent = {
  id: string;
  name: string;
  role: string;
  goal: string;
  bio: string;
  color: AgentColor;
  taskId: string | null; // null = no task assigned in the current crew config
  isHost?: boolean; // host shows in the hero section, not the crew grid
};

// Joan hosts the agency: she introduces the team on the landing page, watches
// the room while the crew works, and signs off when the campaign lands.
export const HOST_ID = "joan_holloway";

export type Task = {
  id: string;
  title: string;
  agentId: string;
  deliverable: string;
};

// Order matches the sequential execution in tasks.yaml. The website renders
// deliverables in this order and maps each task index to its agent.
export const TASK_ORDER: string[] = [
  "client_business_overview_and_requirements",
  "client_discovery_and_briefing",
  "mad_men_campaign_analysis",
  "ai_prompt_strategy_for_mad_men_style",
  "gemini_nano_banana_pro_prompt_optimization",
  "visual_design_specifications_for_client_name_poster",
  "create_final_ai_image_generation_prompt",
  "final_single_advertisement_prompt",
];

export const TASKS: Record<string, Task> = {
  client_business_overview_and_requirements: {
    id: "client_business_overview_and_requirements",
    title: "Client business overview",
    agentId: "client_representative",
    deliverable:
      "Detailed client briefing document with objectives, audience, and competitive landscape.",
  },
  client_discovery_and_briefing: {
    id: "client_discovery_and_briefing",
    title: "Client discovery + creative brief",
    agentId: "pete_campbell",
    deliverable:
      "Structured creative brief: positioning, key messages, success metrics.",
  },
  mad_men_campaign_analysis: {
    id: "mad_men_campaign_analysis",
    title: "Mad Men campaign analysis",
    agentId: "mad_men_advertising_historian",
    deliverable:
      "3-4 specific Sterling Cooper campaigns to draw from, with what to adapt.",
  },
  ai_prompt_strategy_for_mad_men_style: {
    id: "ai_prompt_strategy_for_mad_men_style",
    title: "AI prompt strategy",
    agentId: "don_draper",
    deliverable:
      "Strategic framework for the poster: 1960s aesthetic elements, mood, hooks.",
  },
  gemini_nano_banana_pro_prompt_optimization: {
    id: "gemini_nano_banana_pro_prompt_optimization",
    title: "Qwen-Image-Edit format optimization",
    agentId: "senior_prompt_engineer_1",
    deliverable:
      "Qwen-Image-Edit formatting guidelines: imperative opening, text-rendering technique, palette format, parameters (num_inference_steps, seed, hq).",
  },
  visual_design_specifications_for_client_name_poster: {
    id: "visual_design_specifications_for_client_name_poster",
    title: "Visual design specifications",
    agentId: "sal_romano",
    deliverable:
      "Typography, palette, composition, and period-accurate design notes.",
  },
  create_final_ai_image_generation_prompt: {
    id: "create_final_ai_image_generation_prompt",
    title: "Final image-editor prompt (draft)",
    agentId: "peggy_olson",
    deliverable:
      "200-300 word Qwen-Image-Edit prompt as a single imperative-narrative paragraph.",
  },
  final_single_advertisement_prompt: {
    id: "final_single_advertisement_prompt",
    title: "Final advertisement prompt (polish)",
    agentId: "senior_prompt_engineer_2",
    deliverable:
      "Final 200-300 word Qwen-Image-Edit prompt, ready to paste alongside a blank cream canvas.",
  },
};

// The team grid uses this exact order for the landing page. Joan Holloway is
// listed last because the current crew config doesn't assign her a task —
// that's a known issue in the upstream crew.py / tasks.yaml.
export const TEAM: Agent[] = [
  {
    id: "client_representative",
    name: "Roger Sterling",
    role: "Senior Partner",
    goal: "Brings in the brand, sets the table",
    bio: "Brings in the brand over lunch at the Pierre, then briefs the team on objectives, audience, budget, and tone.",
    color: "teal",
    taskId: "client_business_overview_and_requirements",
  },
  {
    id: "pete_campbell",
    name: "Pete Campbell",
    role: "Account Executive",
    goal: "Runs client discovery and writes the creative brief",
    bio: "Manages the client relationship and turns the brief into a structured creative document.",
    color: "mustard",
    taskId: "client_discovery_and_briefing",
  },
  {
    id: "mad_men_advertising_historian",
    name: "Bertram Cooper",
    role: "Founding Partner · Archivist",
    goal: "Pulls authentic 1960s campaign references",
    bio: "Knows every Sterling Cooper campaign back to 1923. Pulls the patterns worth borrowing, in stocking feet.",
    color: "coral",
    taskId: "mad_men_campaign_analysis",
  },
  {
    id: "don_draper",
    name: "Don Draper",
    role: "Creative Director",
    goal: "Sets the strategic creative framework",
    bio: "Finds the emotional truth. Frames the creative direction for the poster.",
    color: "mustard",
    taskId: "ai_prompt_strategy_for_mad_men_style",
  },
  {
    id: "senior_prompt_engineer_1",
    name: "Harry Crane",
    role: "Head of Media",
    goal: "Picks the format and dials in the spec",
    bio: "Runs the media department. Decides the format, the spec, the print stock, and what plays in 1962.",
    color: "teal",
    taskId: "gemini_nano_banana_pro_prompt_optimization",
  },
  {
    id: "sal_romano",
    name: "Sal Romano",
    role: "Art Director",
    goal: "Designs typography, color, and layout specs",
    bio: "Decides the look of the poster: typeface, palette, geometric composition.",
    color: "coral",
    taskId: "visual_design_specifications_for_client_name_poster",
  },
  {
    id: "peggy_olson",
    name: "Peggy Olson",
    role: "Copywriter",
    goal: "Drafts the headline-driven image prompt",
    bio: "Translates the brief into a 200-350 word descriptive prompt with copy, mood, and emotional truth.",
    color: "mustard",
    taskId: "create_final_ai_image_generation_prompt",
  },
  {
    id: "senior_prompt_engineer_2",
    name: "Ben Feldman",
    role: "Junior Copywriter · Final Pass",
    goal: "The last polish before Joan walks it over",
    bio: "Brilliant, frantic, twice as fast as Peggy. Gives the final pitch one more pass for sharpness.",
    color: "teal",
    taskId: "final_single_advertisement_prompt",
  },
  {
    id: "joan_holloway",
    name: "Joan Holloway",
    role: "VP, Client Services",
    goal: "Hosts the agency, briefs the crew, presents the campaign",
    bio: "Your host. Greets you at the door, briefs the team, keeps the boys on schedule, and presents the final campaign herself.",
    color: "coral",
    taskId: null,
    isHost: true,
  },
];
