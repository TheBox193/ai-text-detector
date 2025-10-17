const has_become_little_more = {
    name: "has_become_little_more",
    description: "AI dismissive reframing: 'has become little more than' or 'nothing beyond'",
    regex: /\b(?:has|have|had) become (?:little|nothing|scarcely|barely) (?:more than|beyond) (?:a |an |the )?[^,.!?]{3,40}\b/gi,
    severity: "high",
    tags: ["reframing", "dismissive", "degradation", "AI_pattern"],
    examples: [
        "Democracy has become little more than a marketing exercise.",
        "Social networks have become nothing more than political theater.",
        "The process had become little beyond an empty gesture.",
        "These initiatives have become nothing beyond surface-level changes.",
        "Performance reviews had become scarcely more than a checkbox exercise.",
        "Environmental summits has become barely more than performative activism.",
        "The platform has become little beyond a cesspool of misinformation.",
        "Education had become scarcely beyond standardized testing preparation."
    ]
};
export default has_become_little_more;
