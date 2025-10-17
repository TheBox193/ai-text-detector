const colon_list = {
    name: "colon_list",
    description: "AI colon introducing a comma-separated list",
    regex: /\b[^.:!?–—-]{5,100}(?:[:]|(?<=\s)[–—-](?=\s))(?=\s(?:[^,.:\n]+,\s*){2,}[^,.:\n]+[.?!])/g,
    severity: "med",
    tags: ["rhetoric", "structure", "AI_pattern"],
    examples: [
        "The key benefits include: speed, accuracy, and reliability.",
        "There are several factors to consider: cost, time, quality, and scope.",
        "The main challenges were: budget constraints, tight deadlines, and resource limitations.",
        "This approach offers multiple advantages: scalability, maintainability, performance, and ease of use.",
        "The process involves three steps: planning, execution, and evaluation.",
        "Several issues emerged — poor communication, unclear requirements, and inadequate testing."
    ]
};
export default colon_list;
