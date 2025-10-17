const this_is_not_contrast = {
    name: "this_is_not_contrast",
    description: `AI dramatic binary contrast: "This is not X. This is Y."`,
    regex: /\b(?:this|that|it(?:['’]?s)?) (?:not|is not|isn['’]?t|was not|wasn['’]?t) [^.!?;,]{3,60}[.!?;,-–—]\s*(?:this|that|it)(?:['’]?s)? (?:is|was|a |an |the |about )?[^.!?;,]{3,60}/gi,
    severity: "high",
    tags: ["contrast", "dramatic", "binary", "AI_pattern"],
    examples: [
        "This is not symbolic. This is a blueprint.",
        "That isn't theory; that's practice.",
        "This wasn't optional, this is essential.",
        "It isn't a suggestion! It's a requirement.",
        "This is not temporary? This's the future.",
        "That wasn't coincidence; that was design.",
        "It's not about quick fixes, it's about sustainable solutions.",
        "It’s not about quick fixes, it’s about sustainable solutions.",
        "This isn't just theoretical discussion - this is actionable strategy."
    ]
};
export default this_is_not_contrast;
