const simplification_framing = {
    name: "simplification_framing",
    description: `AI simplification phrases: "Simply put", "In layman's terms", etc.`,
    regex: /\b(?:simply put|to break it down|in (?:simple|layman['']?s) terms|put simply|to put it simply)\b/gi,
    severity: "med",
    tags: ["simplification", "condescension", "AI_pattern"],
    examples: [
        "Simply put, this approach works better.",
        "To break it down, there are three main components.",
        "In layman's terms, it's like a digital filing cabinet.",
        "Put simply, we need better automation.",
        "To put it simply, timing is everything.",
        "In simple terms, it reduces complexity."
    ]
};
export default simplification_framing;
