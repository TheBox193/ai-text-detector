const its_actually = {
  name: "its_actually",
  description: `AI clarification pattern: "It's actually [qualifier]"`,
  regex:
    /\b(?:it['’`]?s|it is) actually (?:not )?(?:quite|more|rather|fairly|pretty|very|really|much|far|significantly)\b/gi,
  severity: "med" as const,
  tags: ["reframing", "qualification", "AI-pattern"],
  examples: [
    "It's actually quite effective in most scenarios.",
    "It's actually more important than you might think.",
    "It's actually rather surprising how consistent the results are.",
    "It's actually fairly complex when you look under the hood.",
    "It's actually pretty rare to see that in production.",
    "It's actually very typical of systems built at scale.",
    "It's actually really common in modern architectures.",
    "It's actually much easier than traditional approaches.",
    "It's actually far better suited for this use case.",
    "It's actually significantly faster than the baseline.",
    "It's actually not significantly faster than the baseline.",
    "It is actually rather impressive what AI can do.",
    "It is actually not really impressive what AI can do."
  ]
}

export default its_actually
