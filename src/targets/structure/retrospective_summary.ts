const retrospective_summary = {
  name: "retrospective_summary",
  description: `AI backward-looking summary: "As we've seen", "As demonstrated"`, 
  regex: /\bas (?:we['']?ve|you['']?ve|(?:has been|was)) (?:seen|shown|demonstrated|discussed|explored)\b/gi,
  severity: "med" as const,
  tags: ["summary", "retrospective", "AI_pattern"],
  examples: [
    "As we've seen throughout this analysis.",
    "As you've seen in the examples above.",
    "As has been demonstrated in recent studies.",
    "As was shown in the previous section."
  ]
}

export default retrospective_summary;