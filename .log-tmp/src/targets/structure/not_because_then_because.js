const not_because_then_because = {
    name: "not_because_then_because",
    description: "AI split causal reframe: 'Not because X. Because Y.'",
    regex: /\bnot (?:just |merely |simply )?because\b[^.?!]{5,80}[.?!]\s+because\b[^.?!]{5,80}[.?!]/gi,
    severity: "high",
    tags: ["causal", "rhetoric", "contrast", "AI_pattern"],
    examples: [
        "Not because the technology isn't ready. Because we're not ready for the technology.",
        "Not just because it's convenient. Because it fundamentally changes how we think about work.",
        "Not merely because it saves time. Because it transforms the entire user experience.",
        "Not simply because it's profitable. Because it represents a paradigm shift in consumer behavior.",
        "Not because the data is wrong. Because we're asking the wrong questions.",
        "Not because the system failed. Because the system was designed to fail."
    ]
};
export default not_because_then_because;
