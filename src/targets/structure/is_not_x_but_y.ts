const is_not_x_but_y = {
  name: "is_not_x_but_y",
  description: `AI binary reframing: "is not X, but Y" or "wasn't X — it's Y"`,
  regex: /\b(?:is not|isn['’‘]?t|was not|wasn['’‘]?t|are not|aren['’‘]?t|were not|weren['’‘]?t) (?:a |an |the |just )?[^!?]{3,100}\s*(?:but|it['’‘]?s|they['’‘]?re) (?:a |an |the |rather )?[^,.!?]{3,30}\b/gi,
  severity: "high" as const,
  tags: ["reframing", "contrast", "binary", "AI_pattern"],
  examples: [
    "is not a failure of process, but a failure of leadership.",
    "wasn't the exception — it's the rule.",
    "aren't about speed, but about accuracy.",
    "weren't just bugs — they're features.",
    "isn't the problem, but rather the solution.",
    "wasn't temporary, but permanent.",
    "Zebra is not the exception — it’s the rule dressed up in civic language."
  ]
}

export default is_not_x_but_y;