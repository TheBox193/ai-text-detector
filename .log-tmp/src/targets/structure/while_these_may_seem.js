const while_these_may_seem = {
    name: "while_these_may_seem",
    description: `AI hedging contrast: "While these may seem/appear/sound X, they are Y"`,
    regex: /\bwhile (?:they|this|these|it) (?:may|might) (?:seem|appear|sound)[^.?!]{7,100}?\b(?:they (?:are|can be|represent|remain)|it (?:is|can be|represents|remains)|its (?:actually|really|quite))\b/gi,
    severity: "high",
    tags: ["hedging", "contrast", "AI_pattern"],
    examples: [
        "While these may seem like minor changes, they are actually significant.",
        "While this may appear straightforward, it can be quite complex.",
        "While they might seem unrelated, they represent core principles.",
        "While it may sound obvious, it remains a crucial consideration.",
        "While this may seem simple, its actually quite challenging.",
        "While these might appear different, its really the same concept."
    ]
};
export default while_these_may_seem;
