export type SentenceTargets = {
  name: string
  description?: string
  regex: RegExp
  severity?: "low" | "med" | "high"
  tags?: string[]
}

const SENTENCE_TARGETS: SentenceTargets[] = [
  {
    name: "colon-list",
    regex: /\b[^.:!?]{5,100}:\s(?:[^,.:\n]+,\s*){2,}[^,.:\n]+[.?!]/g,
    description: "Colon introducing a comma-separated list",
    severity: "med",
    tags: ["rhetoric", "structure"]
  },
  {
    name: "not-x-but-y",
    regex: /\bnot\b[^.,;:]{1,40}?\bbut\b[^.,;:]{1,40}/gi,
    description: "Contrastive rhetorical structure: not X but Y",
    severity: "med",
    tags: ["contrast", "rhetoric"]
  },
  {
    name: "not-because-but-because",
    regex:
      /\bnot (just |merely |simply )?because\b[^.,;:!?]{1,80}?\bbut\b\s+because\b[^.,;:!?]{1,80}[.?!]/gi,
    description: "Causal reframing: not because X, but because Y",
    severity: "high",
    tags: ["causal", "contrast", "redefinition"]
  },
  {
    name: "not-because-then-because",
    regex:
      /\bnot (just |merely |simply )?because\b[^.?!]{1,80}?[.?!]\s+Because\b[^.?!]{1,80}[.?!]/gi,
    description: "Split reframe: 'Not because X. Because Y.'",
    severity: "high",
    tags: ["causal", "rhetoric", "punctuation-driven"]
  },
  {
    name: "not-just-in-but-in",
    regex:
      /\bnot just\b\s+(in|on|through|by|to|with)\s+[^.,;!?]{2,40}?,\s+but\s+\1\s+[^.,;!?]{2,40}?[.?!,]/gi,
    description: "Rhetorical prepositional mirroring: not just in X, but in Y",
    severity: "med",
    tags: ["scope", "rhetoric", "structure"]
  },
  {
    name: "not-just-x-but-y",
    regex:
      /\bnot just\b[^.,;!?]{1,60}?\bbut\b( also| rather)?[^.,;!?]{1,60}?[.?!,]/gi,
    description: "Rhetorical escalation using 'not just X, but (also) Y'",
    severity: "med",
    tags: ["contrast", "scope", "rhetoric"]
  },
  {
    name: "not-just-midclause",
    regex:
      /\bnot just\b\s+(with|in|by|on|to|for|about)?\s*[^,;:]{1,40},\s+but\s+(with|in|by|on|to|for|about)?\s*[^,;:]{1,40}[.?!]/gi,
    description:
      "Mid-clause rhetorical insert: not just [phrase], but [phrase]",
    severity: "low",
    tags: ["structure", "midclause", "styling"]
  },
  {
    name: "more-than-x",
    regex:
      /\b(?:more than|(?:it|this|that|he|she|they|we)\s+(?:is|was|became)\s+more than)(?: just)?\s[^.,;!?]{3,40},\s+(?:it|this|that|he|she|they|we)?\s*(?:is|was|became)?\s+[^.?!]{3,60}[.?!]/gi,
    description: "Rhetorical escalation using 'more than (just) X, it is Y'",
    severity: "med",
    tags: ["rhetoric", "escalation", "structure"]
  },
  {
    name: "whether-x-or-y",
    regex: /\bwhether\b[\s\S]{5,200}?\bor\b[\s\S]{5,200}?[.,!?]/gi,
    description: "Binary rhetorical setup with 'whether X or Y'",
    severity: "med",
    tags: ["structure", "rhetoric", "binary"]
  },
  {
    name: "sets-x-apart-is",
    regex:
      /\b(what|this|that)?\s*sets\s+[^.,;!?]{1,40}\s+apart\s+(is|are|was|were|has|had|can|could|will|would)\s+[^.?!]{3,80}[.?!]/gi,
    description: "Differentiating claim: 'What sets X apart is Y'",
    severity: "med",
    tags: ["structure", "rhetoric", "differentiation"]
  },
  {
    name: "x-sets-y-apart",
    regex: /\b\w{2,20}\s+sets\s+\w{2,20}\s+apart(?:\s+from\s+\w{2,20})?/gi,
    description: "Active differentiation: 'X sets Y apart (from Z)'",
    severity: "low",
    tags: ["action", "differentiation"]
  },
  {
    name: "from-x-to-y",
    regex: /\bfrom\b[^.,;!?]{3,40}?\bto\b[^.,;!?]{3,40}?,[^.?!]{3,100}[.?!]/gi,
    description: "Scope framing: from X to Y, Z.",
    severity: "med",
    tags: ["structure", "range", "scaffold"]
  },

  {
    name: "three-part-benefit-clause",
    regex:
      /\b\w+(?:\s+\w+){0,3},\s+\w+(?:\s+\w+){0,3},\s+(and|or)\s+\w+(?:\s+\w+){0,3}[.?!]/gi,
    description:
      "Three-part rhetorical coordination (benefits, traits, or actions)",
    severity: "med",
    tags: ["triad", "structure", "rhetoric", "marketing"]
  },
  {
    name: "dash-clarification",
    regex: /\b[^—–\-]{5,100}[—–\-]\s?[^—–\-]{3,50}\s?[—–\-][^.?!]{5,100}[.?!]/g,
    description:
      "Clarifying or narrowing phrase offset by any dash (em/en/hyphen)",
    severity: "med",
    tags: ["structure", "rhetoric", "clarification", "parenthetical"]
  },
  {
    name: "emoji_line_label",
    /* ✅ Instead of:   🔥 Quick tip —   Try this:  */
    regex:
      /(?:^|\r?\n)\s*(?:[\u2700-\u27BF\u1F300-\u1FAFF]\uFE0F?\s*)?(?:[A-Za-z0-9’']+\s*){1,4}[:\-–—][ \t]*(?:\r?\n|$)/gu,
    description:
      "1‑4‑word label (optionally emoji‑prefixed) that *terminates* the line with :, -, – or —",
    severity: "low",
    tags: ["structure", "list", "ai-style"]
  },
  {
    name: "emoji-label-prefix-unicode",
    regex:
      /(?:^|\n)\s*[\u{1F300}-\u{1FAFF}][\uFE0F]?\s+\w{1,4}[\w\s]{0,20}?\s*[:\-–—]/gu,
    description:
      "Line beginning with any emoji (Unicode range) + short phrase + colon/dash",
    severity: "low",
    tags: ["structure", "ai-style", "emoji", "list"]
  },
  {
    name: "negation-assertion-tight",
    regex:
      /\b(This|That|It) isn['’]t\b[^]{1,80}?(?:\.|,|;|—)?\s*it['’]s a\b[^]{1,50}?[.?!]/gi,
    description:
      "Negation followed by assertion (e.g., 'This isn’t X, it’s a Y'), with tight separation",
    severity: "high",
    tags: ["contrast", "assertion", "structure"]
  }
]

export default SENTENCE_TARGETS
