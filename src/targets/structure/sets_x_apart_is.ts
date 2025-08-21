const sets_x_apart_is = {
  name: "sets_x_apart_is",
  description: "AI differentiating claim: 'What sets X apart is Y'",
  regex: /\b(?:what|this|that)?\s*sets\s+[^.,;!?]{3,40}\s+apart\s+(?:is|are|was|were|has|had|can|could|will|would)\s+[^.?!]{5,80}[.?!]/gi,
  severity: "med" as const,
  tags: ["structure", "rhetoric", "differentiation", "AI_pattern"],
  examples: [
    "What sets this approach apart is its focus on long-term sustainability.",
    "This sets our platform apart is the seamless integration with existing workflows.",
    "What sets great leaders apart is their ability to inspire rather than command.",
    "That sets this technology apart is its unprecedented accuracy and speed.",
    "What sets successful companies apart is their commitment to continuous innovation.",
    "This sets the framework apart is its emphasis on practical implementation."
  ]
}

export default sets_x_apart_is;