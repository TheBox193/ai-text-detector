const its_about_reframing = {
  name: "its_about_reframing",
  description: `AI explanatory reframing: "It's really about/not about X"`,
  regex: /\b(?:it['']?s|this is|it isn['']?t) (?:not )?(?:really |actually |ultimately |truly )?(?:not )?(?:about|concerning|regarding)\b/gi,
  severity: "med" as const,
  tags: ["reframing", "explanation", "AI_pattern"],
  examples: [
    "It's really about understanding the core principles.",
    "It's not really about quick fixes.",
    "This is truly about innovation.",
    "It isn't actually concerning the technology.",
    "It's ultimately not regarding compliance.",
    "It isn't truly about individual performance."
  ]
}

export default its_about_reframing;