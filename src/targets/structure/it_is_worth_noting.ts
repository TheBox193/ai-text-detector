const it_is_worth_noting = {
 name: "it_is_worth_noting",
 description: `AI hedged emphasis: "It's worth noting", "It is important to mention"`,
 regex: /\b(?:it(?:['’]?s| is) )?(?:worth noting|important to (?:note|mention|remember))\b/gi,
 severity: "med" as const,
 tags: ["hedging", "emphasis", "AI_pattern"],
 examples: [
   "It is worth noting that results may vary.",
   "It's worth noting the limitations of this approach.",
   "It’s worth noting the limitations of this approach.",
   "It is important to note the following considerations.",
   "It's important to mention these key factors.",
   "important to note that",
   "It is important to remember these guidelines."
 ]
}

export default it_is_worth_noting;