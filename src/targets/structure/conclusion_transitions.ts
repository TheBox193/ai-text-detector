const conclusion_transitions = {
  name: "conclusion_transitions",
  description: `AI conclusion starters: "To wrap up", "In conclusion", "Ultimately"`,
  regex: /\b(?:to (?:wrap up|sum up|summarize|conclude)|in conclusion|ultimately|in the end|at the end of the day)\b/gi,
  severity: "med" as const,
  tags: ["conclusion", "transition", "AI_pattern"],
  examples: [
    "To wrap up, here are the main points.",
    "To sum up what we've discussed today.",
    "Ultimately, the choice depends on your needs.",
    "In conclusion, this approach offers flexibility.",
    "At the end of the day, results matter most."
  ]
}

export default conclusion_transitions;