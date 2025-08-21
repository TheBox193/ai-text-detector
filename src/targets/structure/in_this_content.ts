const in_this_content = {
  name: "in_this_content",
  description: `AI content framing: "In this article" or "This article explores"`,
  regex: /\b(?:in )?this (?:article|piece|post|guide|blog)(?: (?:explores?|examines?|covers?|discusses?|delves? into))?\b/gi,
  severity: "high" as const,
  tags: ["meta", "framing", "AI_pattern"],
  examples: [
    "In this article, we'll explore the key concepts.",
    "This piece examines the fundamental principles.",
    "In this guide, you'll discover practical strategies.", 
    "This post covers everything you need to know.",
    "This article delves into the complexities."
  ]
}

export default in_this_content;