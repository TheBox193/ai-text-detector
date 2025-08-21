const in_a_world_where = {
  name: "in_a_world_where",
  description: "AI dramatic setup: 'In a world/society/era where...' with sweeping claims",
  regex: /\bin (?:a|an) (?:world|society|era|age|time|reality|landscape) (?:where|when) [^.?!]{10,80}\b/gi,
  severity: "high" as const,
  tags: ["temporal", "narrative", "rhetoric", "AI_pattern"],
  examples: [
    "In a world where technology dominates every aspect of our lives, we must remember our humanity.",
    "In a society where information travels at the speed of light, nothing remains private for long.",
    "In an era where everything is connected, true privacy has become impossible.",
    "In a time when artificial intelligence reshapes industries, everyone must adapt or risk obsolescence.", 
    "In a reality where social media defines truth, people struggle to find authentic connection.",
    "In a landscape where data flows freely across borders, no one can escape digital surveillance."
  ]
}

export default in_a_world_where;