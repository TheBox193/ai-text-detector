
const in_todays_digital_age = {
  name: "in_todays_digital_age",
  description: "AI temporal framing cliche: 'In today's digital age'",
  regex: /\bin (?:today['']?s|our) (?:digital age|interconnected world)\b/gi,
  severity: "med" as const,
  tags: ["temporal", "framing", "cliche", "AI_pattern"],
  examples: [
    "In today's digital age, privacy has become a luxury.",
    "In our digital age, attention spans are shrinking rapidly.",
    "In today's interconnected world, isolation seems paradoxical.",
    "In our interconnected world, nothing remains truly private."
  ]
}

export default in_todays_digital_age;