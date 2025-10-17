const in_conclusion = {
    name: "in-conclusion",
    description: `"In conclusion" used as a structural summary signal.`,
    regex: /\b(?:so\s+)?in conclusion\b[:,\s]*/gi,
    severity: "low",
    tags: ["summary", "structure", "AI-pattern"],
    examples: [
        "In conclusion everything is awesome.",
        "So in conclusion everything is awesome.",
    ]
};
export default in_conclusion;
