import { describe, expect, test } from "vitest"

import not_x_but_y from "../not_x_but_y"

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

const NOT_JUST_CASES = [
  ...NOT_JUST_EDGE_CASES,
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

// that’s-not-but
export const THATS_NOT_BUT_CASES = [
  "That’s not a weakness, but a strength in disguise.",
  "That’s not failure, but a stepping stone to success.",
  "That's not the goal, but a byproduct of the process.",
  "That’s not just marketing, but a complete transformation.",
  "That’s not luck, but preparation meeting opportunity.",
  "That’s not the whole story, but only the beginning.",
  "That’s not criticism, but constructive feedback.",
  "That’s not a bug, but a feature.",
  "That's not innovation for its own sake, but for user impact.",
  "That’s not about control, but about empowerment.",
  "That's not chaos, but dynamic adaptation.",
  "That’s not a threat, but a challenge we can rise to.",
  "That’s not a distraction, but a core focus area.",
  "That's not arbitrary, but evidence-based.",
  "That’s not reactive, but a proactive strategy."
]

export const ISNT_JUST_ABOUT_CASES = [
  "Isn’t just about efficiency, it’s about sustainability too.",
  "Isn’t just about access, it’s about meaningful participation.",
  "Isn’t just about speed, it’s about precision and intent.",
  "Isn’t just about metrics, it’s about impact.",
  "Isn’t just about automation, it’s about augmentation.",
  "Isn’t just about the numbers, it’s about the people behind them.",
  "Isn’t just about change, it’s about evolution.",
  "Isn’t just about data, it’s about what we do with it.",
  "Isn’t just about technology, it’s about how we use it.",
  "Isn’t just about scale, it’s about purpose.",
  "Isn’t just about performance, it’s about resilience.",
  "Isn’t just about what we say, it’s about what we do.",
  "Isn’t just about the outcome, it’s about the journey there.",
  "Isn’t just about profits, it’s about values.",
  "Isn’t just about being first, it’s about being right."
]

// Covered by "not just..."
export const ITS_NOT_JUST_CASES = [
  "It’s not just a product, it’s a movement.",
  "It’s not just about speed, it’s about direction.",
  "It’s not just because we can, it’s because we must.",
  "It’s not just the technology, it’s the experience it enables.",
  "It’s not just actually working, it’s redefining how we work.",
  "It’s not just a feature, it’s a fundamental shift.",
  "It’s not just about what we build, it’s about why we build it.",
  "It’s not just because of demand, it’s because of our values.",
  "It’s not just the results, it’s the process that matters.",
  "It’s not just actually helpful, it’s transformative.",
  "It’s not just a company, it’s a culture.",
  "It’s not just the idea, it’s the execution.",
  "It’s not just about cost savings, it’s about sustainability.",
  "It’s not just a trend, it’s the new standard.",
  "It’s not just about data, it’s about insights."
]

const MISC_CASES = [
  "Isn’t just about style, but about substance.",
  "Isn't only about convenience, but also about control.",
  "Wasn’t just a mistake, but a calculated risk.",
  "Wasn't because of laziness, but due to burnout.",
  "Aren’t just minor tweaks, but fundamental shifts.",
  "Aren't only surface-level changes, but deep transformations.",
  "Weren’t just rumors, but verified reports.",
  "Weren't about winning, but about surviving.",
  "Don’t just represent change, but demand it.",
  "Don't only affect one group, but society as a whole.",
  "Didn’t just miscalculate, but completely misunderstood the data.",
  "Didn't only fail to deliver, but actively set us back.",
  "Can’t just blame the system, but must take responsibility.",
  "Can't only focus on speed, but also on safety.",
  "Couldn’t just accept the narrative, but had to question it.",
  "Couldn't only rely on precedent, but needed innovation."
]

export const NOT_X_BUT_Y_CASES = [
  "Not innovation but imitation drove the trend.",
  "Not words but actions define leadership.",
  "Not theory but practice reveals the truth.",
  "Not speed but accuracy is what matters.",
  "Not dreams but discipline shapes success.",
  "Not instinct but training won the match.",
  "Not force but diplomacy resolved the issue.",
  "Not emotion but logic guided the decision.",
  "Not profit but purpose leads our mission.",
  "Not competition but collaboration drives innovation."
]

export const NOT_BECAUSE_BUT_BECAUSE_CASES = [
  "Not just because it's trendy, but because it's effective.",
  "Not merely because others are doing it, but because it aligns with our mission.",
  "Not simply because it’s expected, but because it drives real change.",
  "Not because we have to, but because we believe it’s right.",
  "Not because it’s easy, but because it’s necessary.",
  "Not because of fear, but because of hope.",
  "Not because we’re told to, but because we choose to.",
  "Not because of the reward, but because of the impact.",
  "Not because of tradition, but because of progress.",
  "Not because it looks good, but because it works."
]

export const NOT_BECAUSE_THEN_BECAUSE_CASES = [
  "Not because it was easy. Because it was essential.",
  "Not just because others did it. Because it mattered to us.",
  "Not merely because it was tradition. Because it felt right.",
  "Not simply because we could. Because we should.",
  "Not because it looked good. Because it worked.",
  "Not because of pressure. Because of passion.",
  "Not because it was expected. Because it was needed.",
  "Not just because we had time. Because we made time.",
  "Not merely because of momentum. Because of intention.",
  "Not because we had no choice. Because we believed."
]

export const NOT_JUST_IN_BUT_IN_CASES = [
  "Not just in theory, but in practice.",
  "Not just in name, but in substance.",
  "Not just in the headlines, but in everyday life.",
  "Not just in code, but in behavior.",
  "Not just in promises, but in delivery.",
  "Not just in design, but in execution.",
  "Not just in speech, but in silence.",
  "Not just in the classroom, but in the real world.",
  "Not just in statistics, but in outcomes.",
  "Not just in spirit, but in action."
]

export const NOT_JUST_MIDCLAUSE_CASES = [
  "It was not just in appearance, but in intention.",
  "They succeeded not just by force, but by strategy.",
  "This applies not just to developers, but to designers.",
  "The shift is not just with tools, but with mindset.",
  "Success came not just from planning, but from execution.",
  "Innovation lies not just in hardware, but in software.",
  "Progress depends not just on speed, but on direction.",
  "She stood out not just for her skills, but for her vision.",
  "The campaign was not just about awareness, but about action.",
  "We invest not just for growth, but for resilience."
]

export const NOT_ONLY_BUT_ALSO_CASES = [
  "Not only does it save time, but also reduces errors.",
  "She is not only talented, but also incredibly dedicated.",
  "Not only did we meet expectations, but rather exceeded them.",
  "The solution is not only efficient, but still evolving.",
  "Not only is it affordable, but also environmentally friendly.",
  "He was not only late, but just rude about it.",
  "Not only do they offer support, but also mentorship.",
  "This tool is not only fast, but also intuitive.",
  "Not only does this apply to finance, but also to healthcare.",
  "They not only responded quickly, but also took responsibility."
]

export const ITS_NOT_JUST_CASES_2 = [
  "It’s not just convenient, it’s actually transformative.",
  "It's not just a product, it's a platform.",
  "It’s not just about speed, it’s about sustainability.",
  "It's not just because we care, it's because we must.",
  "It’s not just the interface, it’s the entire experience.",
  "It's not just a theory, it's a proven method.",
  "It’s not just that it works, it’s that it scales.",
  "It’s not just innovation, it’s the new standard.",
  "It's not just helpful, it's essential.",
  "It’s not just a feature, it’s the foundation."
]

export const THIS_ISNT_ITS_CASES = [
  "This isn't a simple change, it's a paradigm shift.",
  "This isn’t just a tool, it’s a transformation.",
  "This isn't reactive, it's proactive.",
  "This isn’t about features, it’s about outcomes.",
  "This isn't an upgrade, it's a revolution.",
  "This isn’t traditional marketing, it's behavior-driven strategy.",
  "This isn't an error, it's a signal.",
  "This isn't guesswork, it's guided by data.",
  "This isn’t a fix, it’s a framework.",
  "This isn’t just convenience, it’s competitive advantage."
]

describe("not_x_but_y", () => {
  test.each(NOT_JUST_CASES)(`not just: "%s"`, (sentence) => {
    const regex = new RegExp(not_x_but_y.regex)
    const result = regex.test(sentence)
    expect(result).toBe(true)
  })

  test.each(NOT_BECAUSE_CASES)(`not because: "%s"`, (sentence) => {
    const regex = new RegExp(not_x_but_y.regex)
    const result = regex.test(sentence)
    expect(result).toBe(true)
  })
  test.each(MISC_CASES)(`Misc: "%s"`, (sentence) => {
    const regex = new RegExp(not_x_but_y.regex)
    const result = regex.test(sentence)
    expect(result).toBe(true)
  })
  test.each([
    ...ISNT_JUST_ABOUT_CASES,
    ...THATS_NOT_BUT_CASES,
    ...NOT_X_BUT_Y_CASES,
    // ...NOT_BECAUSE_BUT_BECAUSE_CASES, // covered
    ...NOT_BECAUSE_THEN_BECAUSE_CASES,
    // ...NOT_JUST_IN_BUT_IN_CASES, // covered
    // ...NOT_JUST_MIDCLAUSE_CASES,
    // ...NOT_ONLY_BUT_ALSO_CASES,
    ...ITS_NOT_JUST_CASES_2,
    ...THIS_ISNT_ITS_CASES,
    ...ITS_NOT_JUST_CASES
  ])(`Junk: "%s"`, (sentence) => {
    const regex = new RegExp(not_x_but_y.regex)
    const result = regex.test(sentence)
    expect(result).toBe(true)
  })
})
