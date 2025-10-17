const its_clear_that = {
  name: "its_clear_that",
  description: "Declarative certainty phrases - AI overconfidence markers",
  regex: /\b(?:it['’]s\s+(?:pretty\s+|quite\s+|fairly\s+)?(?:clear|obvious|evident)(?:\s+that)?|(?:clearly|obviously|evidently),?\s+)\b/gi,
  severity: "medium" as const,
  tags: ["certainty_markers", "overconfidence", "AI_pattern"],
  examples: [
    "It's clear that renewable energy is the future.",
    "It's pretty obvious that users prefer this interface.",
    "Clearly, the data supports this conclusion.",
    "Obviously, security should be a priority.",
    "It's quite evident that collaboration improves outcomes.",
    "Evidently, the market is shifting towards mobile solutions."
  ]
};

export default its_clear_that;