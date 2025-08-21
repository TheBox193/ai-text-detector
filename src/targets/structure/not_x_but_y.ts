// export const not_just_x_but_y = {
//   name: "not-just-x-but-y",
//   regex:
//     /\bnot just\b[^.,;!?]{1,60}?\bbut\b( also| rather)?[^.,;!?]{1,60}?[.?!,]/gi,
//   description: "Rhetorical escalation using 'not just X, but (also) Y'",
//   severity: "med",
//   tags: ["contrast", "scope", "rhetoric"]
// }

// export const not_just_but = {
//   name: "not-just-but",
//   description: `"Not just ... but" pattern for false contrast or rhetorical depth.`,
//   regex: /\bnot just\b[^.?!]{0,80}?\bbut (also|rather|a|the)\b/gi,
//   severity: "med",
//   tags: ["negation", "contrast", "AI-pattern"]
// }

// isn’t|isn't|wasn’t|wasn't|aren’t|aren't|weren’t|weren't|don’t|don't|didn’t|didn't|can’t|can't|couldn’t|couldn't

const NOT_JUST_EDGE_CASES = [
  "Not just clever but also wise enough to see the long-term consequences.", // Complex Y clause
  "Not just the users, who have been loyal since beta – but the developers as well.", // Longer X with internal punctuation
  "Not just smart (by traditional metrics), but also creative.", // Parenthetical in X or Y
  "Not just a goal: a moral imperative, but one with real consequences.", // Clause with colon
  // "Not just an idea... but a necessity.", // Ellipsis (non-standard punctuation)
  "Not just the will, nor just the resources, but the timing aligned as well.", // Extra conjunctions
  "Not just a student, but learned to become a teacher.", // But-phrase starts with verb instead of noun
  "Not just freedom\nbut the responsibility that comes with it." // Line break between "not just" and "but"
]

export const NOT_BECAUSE_CASES = [
  "Not because it's popular, but because it's necessary.",
  "Not because they asked, but because we care.",
  "Not because we fear failure, but because we strive for excellence.",
  "Not because the rules say so, but because it's the right thing to do.",
  "Not because it's easy, but because it matters.",
  "Not because of obligation, but out of genuine passion.",
  "Not because we have to, but because we want to.",
  "Not because tradition demands it, but because innovation requires it.",
  "Not because we're expected to, but because we choose to.",
  "Not because it's convenient, but because it's impactful.",
  "Not because of pressure, but because of conviction.",
  "Not because the data told us to, but because the story demanded it.",
  "Not because it's simple, but because it's transformative.",
  "Not because we’re perfect, but because we’re committed.",
  "Not because of appearances, but because of substance."
]

const NOT_JUST_CASES = [
  ...NOT_JUST_EDGE_CASES,
  ...NOT_BECAUSE_CASES,
  "Not just innovation, but a revolution in how we think.",
  "Not just data, but actionable insights that drive impact.",
  "Not just a product, but a complete ecosystem.",
  "Not just a challenge, but an opportunity in disguise.",
  "Not just better, but fundamentally different.",
  "Not just performance, but performance with purpose.",
  "Not just content, but a compelling narrative.",
  "Not just accessible, but universally inclusive.",
  "Not just another feature, but a game-changer.",
  "Not just speed, but intelligent efficiency.",
  "Not just the present, but a glimpse into the future.",
  "Not just automation, but human-centered automation.",
  "Not just scalable, but effortlessly scalable.",
  "Not just compliance, but proactive governance.",
  "Not just solving problems, but redefining what's possible.",
  "Not just fast, but rather reliable.",
  "Not just smart but brilliant.",
  "Not just clever but also wise.",
  "Not just a theory, but practice.",
  "It’s not just about winning, but about values.",
  "They not just survived but thrived.",
  "He’s not just smart but also emotionally intelligent.",
  "Not just with style but with substance.",
  "Not just an idea, but a movement.",
  "He is not just the CEO, but the founder too.",
  "Not just in words, but in actions.",
  "Not just in theory or ideology, but in day-to-day practice.",
  "We are not just observers, but participants in history.",
  "Not just innovation, but a revolution in how we think.",
  "Not just data, but actionable insights that drive impact.",
  "Not just a product, but a complete ecosystem.",
  "Not just a challenge, but an opportunity in disguise.",
  "Not just better, but fundamentally different.",
  "Not just performance, but performance with purpose.",
  "Not just content, but a compelling narrative.",
  "Not just accessible, but universally inclusive.",
  "Not just another feature, but a game-changer.",
  "Not just speed, but intelligent efficiency.",
  "Not just the present, but a glimpse into the future.",
  "Not just automation, but human-centered automation.",
  "Not just scalable, but effortlessly scalable.",
  "Not just compliance, but proactive governance.",
  "Not just solving problems, but redefining what's possible."
]


const not_x_but_y = {
  name: "not_x_but_y",
  regex:
    /(\bnot\b|n['’]t\b)\s+(just|because|only|about|simply|merely)\b[^.?!]{1,100}?\b(but|about)\b[^.?!]{1,100}?[.?!,]/gi,
  description:
    "Rhetorical contrast escalation: 'not X, but Y'",
  severity: "med" as const,
  tags: ["contrast", "rhetoric", "pattern"],
  examples: NOT_JUST_CASES,
}

export default not_x_but_y
