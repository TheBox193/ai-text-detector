const colon_reframe = {
    name: "colon_reframe",
    description: "AI colon introducing reframe or abstract generalization",
    regex: /\b[^:.?!\n]{10,200}:(?=\s[^,.:\n]{5,40}\s(?:[^.?!:\n]{3,200})?[.?!])/g,
    severity: "med",
    tags: ["rhetoric", "structure", "reframe", "AI_pattern"],
    examples: [
        "The real issue here: it's about trust and communication.",
        "What this really means: we've fundamentally misunderstood the problem.",
        "The key insight: context matters more than content in most situations.",
        "Here's the fundamental problem: we're solving the wrong question entirely.",
        "The deeper truth: success isn't about working harder but working smarter.",
        "What we're really talking about: the intersection of technology and human behavior.",
        "The core challenge: balancing innovation with practical implementation constraints."
    ]
};
export default colon_reframe;
