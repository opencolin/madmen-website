export type AgentColor = "mustard" | "teal" | "coral" | "cream";

export type Agent = {
  id: string;
  name: string;
  role: string;
  goal: string;
  bio: string;
  color: AgentColor;
  taskId: string | null; // null = no task assigned (e.g. Joan in the current crew config)
};

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
    title: "Gemini Nano Banana optimization",
    agentId: "senior_prompt_engineer_1",
    deliverable:
      "Model-specific prompt formatting, parameters, and structure guidelines.",
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
    title: "Final image generation prompt (draft)",
    agentId: "peggy_olson",
    deliverable:
      "200-350 word Gemini-ready prompt as a descriptive narrative paragraph.",
  },
  final_single_advertisement_prompt: {
    id: "final_single_advertisement_prompt",
    title: "Final advertisement prompt (polish)",
    agentId: "senior_prompt_engineer_2",
    deliverable:
      "Final 200-350 word Gemini Nano Banana prompt, ready to paste.",
  },
};

// The team grid uses this exact order for the landing page. Joan Holloway is
// listed last because the current crew config doesn't assign her a task —
// that's a known issue in the upstream crew.py / tasks.yaml.
export const TEAM: Agent[] = [
  {
    id: "client_representative",
    name: "Client Rep",
    role: "Marketing Director",
    goal: "Provides business information and brand context",
    bio: "Acts as the client. Briefs the team on objectives, target audience, budget, and brand voice.",
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
    name: "Mad Men Historian",
    role: "Reference Expert",
    goal: "Pulls authentic 1960s campaign references",
    bio: "Knows every Sterling Cooper campaign from Lucky Strike to Burger Chef. Picks 3-4 patterns to inspire.",
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
    name: "Prompt Engineer",
    role: "Senior Specialist",
    goal: "Optimizes for Gemini Nano Banana Pro",
    bio: "Adds aspect ratio, camera angle, lighting. Enforces Gemini's prompt format.",
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
    name: "Final Polish",
    role: "Senior Specialist",
    goal: "Final pass on the Gemini-ready prompt",
    bio: "Last pass: word count, Gemini Nano Banana formatting, no boardroom scenes.",
    color: "teal",
    taskId: "final_single_advertisement_prompt",
  },
  {
    id: "joan_holloway",
    name: "Joan Holloway",
    role: "Office Manager",
    goal: "Coordinates the crew",
    bio: "Listed in the agent roster but the current crew config doesn't assign her a task. Kept here as a known orphan.",
    color: "cream",
    taskId: null,
  },
];
