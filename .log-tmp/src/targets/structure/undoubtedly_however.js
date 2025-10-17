const undoubtedly_however = {
    name: "undoubtedly_however",
    description: `AI false nuance: strong assertion followed by contradiction`,
    regex: /\b(?:undoubtedly|certainly|clearly)[^.?!]{10,100}?\b(?:however|but|yet|nevertheless)\b/gi,
    severity: "high",
    tags: ["hedging", "false_nuance", "AI_pattern"],
    examples: [
        "Undoubtedly, this approach has merit, however there are challenges.",
        "Certainly, the benefits are clear, but we must consider costs.",
        "Clearly, efficiency is important, yet flexibility matters too.",
        "Undoubtedly, the data shows promise, nevertheless caution is needed.",
        "Certainly the methodology is sound, however implementation varies."
    ]
};
export default undoubtedly_however;
