const key_takeaway_framing = {
  name: "key_takeaway_framing", 
  description: `AI summary framing: "Key takeaway", "One thing is clear"`,
  regex: /\b(?:(?:the|a) key takeaway(?: here)?|one thing is (?:clear|certain))\b/gi,
  severity: "high" as const,
  tags: ["summary", "framing", "AI_pattern"],
  examples: [
    "The key takeaway here is that timing matters.",
    "A key takeaway from this analysis is clarity.",
    "One thing is clear: we need better processes.",
    "One thing is certain about this approach."
  ]
}

export default key_takeaway_framing;