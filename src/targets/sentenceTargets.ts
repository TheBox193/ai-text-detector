
import * as cases from './structure/index'

export type SentenceTargets = {
  name: string
  description?: string
  regex: RegExp
  severity?: "low" | "med" | "high"
  tags?: string[],
  examples?: string[]
}

const END_OF_SENTENCE = `[.?!…:;—–](?:["')\]]+)?(?=\s|\n|$)`

const SENTENCE_TARGETS: SentenceTargets[] = [
  ...Object.values(cases),
  /** Negation + Reframe */
  // {
  //   name: "it's-not-just",
  //   description: `"It’s not just ... it’s [something else]" — common ChatGPT reframing pattern.`,
  //   regex:
  //     /\bit['’‘]?s not just\b[^.?!]{0,80}?\bit['’‘]?s (a|about|because|the|actually)\b/gi,
  //   severity: "high",
  //   tags: ["negation", "reframing", "structure"]
  // },
  // {
  //   name: "this-isn’t-it’s",
  //   description: `"This isn't ... it's [something else]" — used to reframe or redirect perspective.`,
  //   regex: /\bthis isn['’‘]?t\b[^.?!]{0,80}?\bit['’‘]?s\b/gi,
  //   severity: "high",
  //   tags: ["negation", "reframing", "AI-pattern"]
  // },
  {
    name: "that’s-not-but",
    description: `"That’s not ... but [reframe]" — emphatic denial followed by contrast.`,
    regex: /\bthat['’‘]?s not\b[^.?!]{0,100}?\bbut\b/gi,
    severity: "med",
    tags: ["negation", "contrast", "structure"]
  },
  {
    name: "isn’t-just-about",
    description: `"Isn’t just about ... it’s about" — AI-style depth framing.`,
    regex: /\bisn['’‘]?t just about\b[^.?!]{0,80}?\bit['’‘]?s about\b/gi,
    severity: "med",
    tags: ["negation", "depth", "AI-pattern"]
  },

  /** Summary / Conclusion Scaffold */
  // {
  //   name: "to-wrap-up",
  //   description: `Phrases like "To sum up" or "To wrap up" indicating forced rhetorical closure.`,
  //   regex: /\bto (?:sum up|wrap up|summarize)\b[:,\s]*/gi,
  //   severity: "low",
  //   tags: ["summary", "structure", "AI-pattern"]
  // },
  // {
  //   name: "final-thoughts",
  //   description: `Cliché closers like "Final thoughts" or "Parting thoughts" that mimic blog-style endings.`,
  //   regex: /\b(?:final|parting|closing) thoughts\b[:,\s]*/gi,
  //   severity: "low",
  //   tags: ["summary", "framing", "AI-pattern"]
  // },
  // {
  //   name: "as-we-have-seen",
  //   description: `"As we've seen" and variants that signal backward-looking narrative closure.`,
  //   regex:
  //     /\bas (?:we[’']?ve|you[’']?ve|has been) (?:seen|shown|demonstrated)\b[:,\s]*/gi,
  //   severity: "low",
  //   tags: ["summary", "retrospective", "rhetoric"]
  // },
  // {
  //   name: "key-takeaway",
  //   description: `Phrases declaring a "key takeaway" or similar punchline summaries.`,
  //   regex: /\b(the|a) key takeaway(?: here)? (?:is that|:)?\b/gi,
  //   severity: "med",
  //   tags: ["summary", "repetition", "framing"]
  // },
  // {
  //   name: "ultimately-closure",
  //   description: `"Ultimately" or "At the end of the day" as rhetorical finality devices.`,
  //   regex:
  //     /\b(ultimately|in the end|at the end of the day|one thing is clear)\b[:,\s]*/gi,
  //   severity: "med",
  //   tags: ["summary", "finality", "AI-pattern"]
  // },

  // --- Balanced Comparison + Hedge Cluster ---
  // {
  //   name: "while-these-may-seem",
  //   description: `Hedging setup: "While these may seem [X], they are [Y]". Used to soften transitions.`,
  //   regex:
  //     /\bwhile (?:they|this|these) may seem\b[^.?!]{0,100}?\b(?:they are|they can be|they represent|they remain)\b/gi,
  //   severity: "high",
  //   tags: ["hedge", "contrast", "AI-pattern"]
  // },
  {
    name: "that-being-said",
    description: `Overused contrast marker in AI writing: "That being said", "Having said that".`,
    regex:
      /\b(that being said|having said that|even so|nonetheless|nevertheless)\b[:,\s]*/gi,
    severity: "low",
    tags: ["contrast", "transitions", "structure"]
  },
  // {
  //   name: "undoubtedly-however",
  //   description: `Paired hedging combo like "Undoubtedly ... however", used to sound nuanced.`,
  //   regex: /\bundoubtedly\b[^.?!]{0,60}?\bhowever\b/gi,
  //   severity: "med",
  //   tags: ["hedge", "nuance", "AI-pattern"]
  // },
  // {
  //   name: "it-is-worth-noting",
  //   description: `"It is worth noting" and similar softeners that signal hedged emphasis.`,
  //   regex:
  //     /\bit is (worth noting|important to note|often said|widely recognized)\b/gi,
  //   severity: "low",
  //   tags: ["hedge", "softener", "AI-pattern"]
  // },
  {
    name: "arguably-generally",
    description: `Cautious claim intro words like "Arguably", "Generally speaking", "Some might say".`,
    regex:
      /\b(arguably|some might say|generally speaking|it can be argued that|broadly speaking)\b/gi,
    severity: "med",
    tags: ["hedge", "soft-claim", "structure"]
  },
  {
    name: "important-to-consider",
    description: `Weak framing signals that try to pre-justify an idea: "important to consider", etc.`,
    regex:
      /\b(important to consider|key factor|critical to understand|crucial element)\b/gi,
    severity: "low",
    tags: ["hedge", "justification", "structure"]
  },

  // --- Faux Depth / Reframing Cluster ---
  // {
  //   name: "at-its-core",
  //   description: `Used to assert deeper meaning or essential truth, often artificially: "At its core", "At the heart of it".`,
  //   regex: /\b(at its core|at the heart of (?:this|it|the matter))\b/gi,
  //   severity: "med",
  //   tags: ["reframing", "depth", "AI-pattern"]
  // },
  // {
  //   name: "to-put-it-simply",
  //   description: `"To put it simply", "Simply put" – rhetorical simplification often used before redundancy or false clarity.`,
  //   regex: /\b(to put it simply|simply put|in layman['’]?s terms)\b[:,\s]*/gi,
  //   severity: "low",
  //   tags: ["simplification", "faux-depth", "AI-pattern"]
  // },
  // {
  //   name: "it’s-about-reframing",
  //   description: `"It’s about", "This is about", "It's not just ... it's about" – classic AI reframing scaffold.`,
  //   regex: /\b(it['’]?s|this is) (?:really )?about\b/gi,
  //   severity: "high",
  //   tags: ["reframing", "structure", "AI-pattern"]
  // },
  // {
  //   name: "not-just-its-a",
  //   description: `Reframes a thing as deeper/real: "It's not just X, it's a Y", or "It's not just about X, it's about Y".`,
  //   regex:
  //     /\bit['’]?s not just (?:about )?[^.?!]{0,60}?\bit['’]?s (?:a|about|the)\b/gi,
  //   severity: "high",
  //   tags: ["reframing", "contrast", "AI-pattern"]
  // },
  // {
  //   name: "not-just-dash-reframe",
  //   description: `"Not just X – it is Y" rhetorical structure using an em/en dash for artificial emphasis.`,
  //   regex: /\bnot just\s+\w+(?:\s+\w+){0,3}?\s[–—]\s+it\s+is\s+\w+/gi,
  //   severity: "high",
  //   tags: ["reframing", "structure", "AI-pattern"]
  // },
  {
    name: "faux-illumination",
    description: `Phrases like "sheds light on", "illuminates", or "reveals" to imply significance.`,
    regex:
      /\b(sheds? light on|illuminates?|reveals?|uncovers?)\b[^.?!]{0,80}?(?:truth|pattern|core|issue|question|problem|challenge)\b/gi,
    severity: "med",
    tags: ["faux-depth", "insight", "rhetoric"]
  },
  {
    name: "broader-perspective",
    description: `Invocations of perspective to elevate banality: "broader perspective", "deeper understanding", "big picture".`,
    regex:
      /\b(?:broader|deeper|wider|holistic|big)\s+(?:perspective|understanding|context|picture|view|insight)\b/gi,
    severity: "low",
    tags: ["faux-depth", "perspective", "AI-pattern"]
  },

  // --- Temporal Framing Cluster ---
  // {
  //   name: "in-todays-digital-age",
  //   description: `Overused modern-era framing: "In today's digital age", "modern world", "tech-driven society".`,
  //   regex:
  //     /\b(in (?:today['’]?s|our) (?:digital|modern|tech[- ]?driven|fast[- ]?paced) (?:world|age|society))\b/gi,
  //   severity: "high",
  //   tags: ["temporal", "framing", "AI-pattern"]
  // },
  // {
  //   name: "in-a-world",
  //   description: `"In a world where..." cliché to set up hypothetical or dramatic stakes.`,
  //   regex:
  //     /\bin a world where\b[^.?!]{0,80}?(?:we|people|humans|technology|everything)\b/gi,
  //   severity: "high",
  //   tags: ["temporal", "narrative", "rhetoric"]
  // },
  {
    name: "before-you",
    description: `Call-to-action openings using time-hook: "Before you [act, decide, do anything]..."`,
    regex:
      /\bbefore you\b[^.?!]{0,50}?\b(?:decide|act|do|choose|click|start|begin)\b/gi,
    severity: "low",
    tags: ["temporal", "CTA", "marketing"]
  },
  // Punctuation in odd ways
  {
    name: "mid-dash-interjection",
    description: `Em dash or en dash used mid-sentence to insert a reflective or rhetorical aside.`,
    regex: new RegExp(
      String.raw`^[^.?!\n]{10,300}?\s[-–—]\s([^–—.?!\n]{5,700}?[.?!])(?![^.?!\n]*[-–—])`,
      "gi"
    ),
    severity: "med",
    tags: ["structure", "digression", "AI-pattern"]
  },
  {
    name: "interrupted-dash-frame",
    description: `Two em/en dashes enclosing a long parenthetical interruption mid-sentence: ".. x – parenthetical interruption – y ...`,
    regex: new RegExp(String.raw`\s[-–—]\s([^–—\n]{3,700}?)\s[-–—]`, "gi"),
    severity: "high",
    tags: ["structure", "interruption", "dash", "AI-pattern"]
  },
  // {
  //   name: "colon-list",
  //   regex:
  //     /\b[^.:!?–—-]{5,100}(?:[:]|(?<=\s)[–—-](?=\s))\s(?:[^,.:\n]+,\s*){2,}[^,.:\n]+[.?!]/g,
  //   description: "Colon introducing a comma-separated list",
  //   severity: "med",
  //   tags: ["rhetoric", "structure"]
  // },
//   {
//   name: "colon-reframe",
//   description: `Colon used to introduce a reframe, punchline, or abstract generalization — not a list.`,
//   regex: /\b[^:.?!\n]{10,200}:\s[^,.:\n]{5,40}\s(?:[^.?!:\n]{3,200})?[.?!]/g,
//   severity: "med",
//   tags: ["rhetoric", "structure", "reframe"]
// },


  ///// ***** /////
  // {
  //   name: "not-x-but-y",
  //   regex: /\bnot\b[^.,;:]{1,40}?\bbut\b[^.,;:]{1,40}/gi,
  //   description: "Contrastive rhetorical structure: not X but Y",
  //   severity: "med",
  //   tags: ["contrast", "rhetoric"]
  // },
  {
    name: "not-because-then-because",
    regex:
      /\bnot (just |merely |simply )?because\b[^.?!]{1,80}?[.?!]\s+Because\b[^.?!]{1,80}[.?!]/gi,
    description: "Split reframe: 'Not because X. Because Y.'",
    severity: "high",
    tags: ["causal", "rhetoric", "punctuation-driven"]
  },
  {
    name: "more-than-x",
    regex:
      /\b(?:more than|(?:it|this|that|he|she|they|we)\s+(?:is|was|became)\s+more than)(?: just)?\s[^.,;!?]{3,40},\s+(?:it|it\'s|this|that|he|she|they|we)?\s*(?:is|was|became)?\s+[^.?!]{3,60}[.?!]/gi,
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
    name: "parenthetical-item-list",
    regex:
      /\(\s*(e\.g\.|such as|including)?\s*(?:[A-Z][\w\-\.]*(?:\s+[A-Z][\w\-\.]*)?,\s*){1,4}[A-Z][\w\-\.]*(?:\s+[A-Z][\w\-\.]*)?\s*\)/g,
    description:
      "Parenthetical list of 2+ capitalized items (e.g., ChatGPT, Claude, Gemini)",
    severity: "med",
    tags: ["list", "padding", "structure", "ai-style"]
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

  // {
  //   name: "three-part-benefit-clause",
  //   regex:
  //     /\b\w+(?:\s+\w+){0,3},\s+\w+(?:\s+\w+){0,3},\s+(and|or)\s+\w+(?:\s+\w+){0,3}[.?!]/gi,
  //   description:
  //     "Three-part rhetorical coordination (benefits, traits, or actions)",
  //   severity: "med",
  //   tags: ["triad", "structure", "rhetoric", "marketing"]
  // },
  // {
  //   name: "dash-clarification",
  //   regex: /\b[^—–\-]{5,100}[—–\-]\s?[^—–\-]{3,50}\s?[—–\-][^.?!]{5,100}[.?!]/g,
  //   description:
  //     "Clarifying or narrowing phrase offset by any dash (em/en/hyphen)",
  //   severity: "med",
  //   tags: ["structure", "rhetoric", "clarification", "parenthetical"]
  // },
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
      /\b(This|That|It) isn['’‘]t\b[^]{1,80}?(?:\.|,|;|—)?\s*it['’‘]s a\b[^]{1,50}?[.?!]/gi,
    description:
      "Negation followed by assertion (e.g., 'This isn’t X, it’s a Y'), with tight separation",
    severity: "high",
    tags: ["contrast", "assertion", "structure"]
  }
]

export default SENTENCE_TARGETS
