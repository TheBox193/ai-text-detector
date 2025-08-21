const at_its_core_reframing = {
  name: "at_its_core_reframing",
  description: `AI depth signaling: "At its/the core/heart/essence"`,
  regex: /\b(?:at|in) (?:its|the) (?:core|heart|essence|foundation|root|crux|basis|center|soul)\b/gi,
  severity: "high" as const,
  tags: ["reframing", "depth_signaling", "AI_pattern"],
  examples: [
    "At its core, this is about efficiency.",
    "In its essence, the problem is simple.",
    "At the heart of this lies efficiency.", 
    "In the center of it all is trust.",
    "At its foundation, we need alignment.",
    "In its soul, the company values innovation.",
    "At the crux of it, we need clarity.",
    "In the root of the matter lies truth."
  ]
}

export default at_its_core_reframing;