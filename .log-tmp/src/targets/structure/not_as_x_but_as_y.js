const not_as_x_but_as_y = {
    name: "not_as_x_but_as_y",
    description: `AI definitional contrast: "not as X, but as Y"`,
    regex: /\bnot as (?:a |an |the )?[^,.!?]{5,60}[,]\s*but as (?:a |an |the )?[^,.!?]{5,60}\b/gi,
    severity: "high",
    tags: ["contrast", "definition", "AI_pattern"],
    examples: [
        "not as a system of voting and procedures, but as a living democracy.",
        "not as an endpoint, but as a continuous process.",
        "not as a problem to solve, but as an opportunity to embrace.",
        "not as a limitation, but as a feature.",
        "not as the exception, but as the rule.",
        "not as individual tasks, but as interconnected systems."
    ]
};
export default not_as_x_but_as_y;
