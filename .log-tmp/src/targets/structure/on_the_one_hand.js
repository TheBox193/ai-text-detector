const on_the_one_hand = {
    name: "on_the_one_hand",
    description: `AI false-balance setup: "On the one hand", "On one side", etc.`,
    regex: /\bon (?:the )?(?:one|other) (?:hand|side)\b/gi,
    severity: "med",
    tags: ["comparison", "structure", "balance"],
    examples: [
        "On the one hand, this approach offers flexibility.",
        "On the other hand, it requires more resources.",
        "On one hand, we save time.",
        "On one side, there are benefits.",
        "On the other side, we face challenges."
    ]
};
export default on_the_one_hand;
