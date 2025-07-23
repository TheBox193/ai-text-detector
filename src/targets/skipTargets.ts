const SKIP_TAGS = [
  // Non-rendered or script-driven
  "script",
  "style",
  "noscript",
  "template",

  // UI controls and input containers
  "input",
  "select",
  "textarea",
  "button",
  "option",
  "label",

  // Programmatic data blocks
  "code",
  "pre",
  "samp",
  "kbd",
  "var",

  // Semantic structure but typically non-user-facing
  "nav",
  "aside",
  "footer",
  "form",
  "header",
  "menu",

  // Repetitive or boilerplate UI
  "svg",
  "canvas",
  "math",

  // Advertisements or dynamic placeholders
  "iframe",
  "embed",
  "object",
  "video",
  "audio",

  // Hidden layout scaffolds
  "style",
  "link"
]

export function shouldSkipNode(n: Node): boolean {
  return !!n.parentElement?.closest(SKIP_SELECTOR)
}

const SKIP_SELECTOR = SKIP_TAGS.join(",")

export default SKIP_SELECTOR;