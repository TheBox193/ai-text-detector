import expandPunctuationVariants from "~utils/expandPunctuationVariants";

const WORD_TARGETS = [
  /* punctuation cues */
  "—", // em-dash
  "–", // en-dash
  "…", // Horizontal Ellipsis
  // "...", // Human-style ellipsis
  // ":", // Colon
  "•", // Bullet
  "‣", // Triangular Bullet
  "«", // Left guillemet
  "»", // Right guillemet

  /* space variants */
  " ", // Non-breaking space (NBSP)
  " ", // Narrow No-Break Space
  " ", // En quad
  " ", // Em quad
  " ", // Thin space
  " ", // Hair space
  " ", // Medium mathematical space
  "　", // Full-width ideographic space
  " ", // Three-per-em space
  " ", // Four-per-em space
  " ", // Six-per-em space
  " ", // Figure space
  " ", // Punctuation space

  /* invisible/control characters */
  "​", // Zero-width space
  "‌", // Zero-width non-joiner
  "‍", // Zero-width joiner
  "﻿", // Byte order mark (BOM)
  "­", // Soft hyphen

  /* optional BiDi control (AI watermarks) */
  // "‎", // left-to-right mark
  // "‏", // right-to-left mark
  // "‪", // LTR embedding
  // "‫", // RTL embedding
  // "‬", // pop directional formatting
  // "‭", // LTR override

  /* boiler-plate openers / closers */
  "In conclusion",
  "In summary",
  "important to remember",
  "To summarize",
  "Let's explore",
  "Join us as we",
  "Take a closer look",
  "Ultimately",
  "At its core",
  "In today's digital age",
  "In the realm of",
  "To put it simply",
  "Not just",
  "just not",
  "That is not",
  "and why",
  "One thing is clear",
  "There's no denying",
  "Read on to discover",
  "takeaway",
  "To wrap up",
  "Final thoughts",
  "As we've seen",
  "In this article",
  "Let's dive in",

  /* Expository scaffolding */
  "The following",
  "The key takeaway",
  "This article explores",

  /* transition words AI over-uses */
  "Accordingly",
  "Additionally",
  "In addition",
  "Consequently",
  "That being said",
  "Moreover",
  "Importantly",
  "However",
  "Indeed",
  "Furthermore",
  "This highlights",
  "Thus",
  "Hence",
  "Nevertheless",
  "Nonetheless",
  "Undoubtedly",
  "Whether",
  "know that",
  "On the one hand",
  "On the other hand",
  "very important",
  "critically important",
  "At the same time",
  "as long as",
  "Shed light on",
  "Bolster",
  "Differentiate",

  /* hedging / meta phrases */
  "question now is",
  "but how",
  "It is important to note",
  "It is worth noting that",
  "Not only",
  "In order to",
  "don't have to",
  "don't just",
  "can't just",
  "just have to",
  "That's not",
  "it's about",
  "but rather",
  "While these",
  "may seem",
  "This isn't",
  "This is about",
  "it's actually",
  "it's not just",
  "it's a",
  "It's safe to say",
  "No doubt",
  "The fact is",
  "needless to say",
  "It goes without saying",
  "is not the",
  "is not a",
  "but a",
  "dressed up",
  "not because it",
  "As we know",
  "As you know",
  "important to consider",
  "biggest challenge",
  "key factor",
  "crucial",
  "Generally speaking",
  "Arguably",
  "Broadly speaking",

  /* marketing-style hooks */
  "Unlock the secrets",
  "Game changer",
  "ever-evolving",
  "Cutting-edge",
  "Designed to enhance",
  "shift",
  "Paradigm",
  "Unprecedented",
  "Synergy",
  "counterpoint",
  "tapestry",
  "Synthesis",
  "especially",
  "framed",
  "delve",
  "What remains",
  "broader perspective",
  "Most importantly",
  "isn't just about",
  "isn't just",
  "isn't a",
  "It might just",
  "And sometimes",
  "pivotal role",
  "pivotal",
  "realm",
  "illuminate",
  "the core",
  "Before you",
  "essential",
  "is often",
  "isn't about",
  "it's about",
  "it’s the",
  "The best",
  "fostering",
  "fosters",
  "in fact",
  "Some might say",
  "In short",
  "to summarize",
  "you might ask",
  "Yet there is",
  "It is therefore",
  "In addition to",
  "So when",
  "underscores",
  "only time will tell",
  "important to note that",
  "It can be argued that",
  "It is widely recognized that",
  "To sum up",
  "as a result",
  "or just want",
  "that doesn't mean",
  "That's why",
  "crossroads",
  "must ask",
  "deserves better",
  "Let's be honest",
  "What about",
  "but not this",
  "transform how",
  "do more than",
  "Three",
  "the fewer",
  "Break Down Why",
  "Break it down",
  "What You Can Do",
  "And know",
  "be sure to",
  "disrupt",
  "empower",
  "streamline",
  "optimize",
  "robust",
  "holistic",
  "scalable",
  "synergistic",
  "In a world",
  "isn't",

  /* Inflated Modifiers */
  "truly remarkable",
  "absolutely essential",

  /* verbs ChatGPT loves */
  "Embark",
  "Delve",
  "Leverage",
  "Elevate",
  "Harness",
  "pushing the boundaries",
  "remarkable",
  "cutting-edge",
  "revolutionize the way",
  "Unleash",
  "Revolutionize",
  "Transformative",
  "Seamless integration",
  "Game-changing",
  "Navigate"
]

const WORD_TARGETS_FULL = expandPunctuationVariants(WORD_TARGETS)

export default WORD_TARGETS_FULL;