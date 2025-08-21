function wrapMatch(
  node: Text,
  start: number,
  end: number,
  className: string,
  style: string,
  rule?: string,
  tooltip?: string
) {
  const text = node.nodeValue
  const before = document.createTextNode(text.slice(0, start))
  const match = document.createElement("span")
  match.className = className
  match.textContent = text.slice(start, end)
  match.style.cssText = style
  if (rule) match.setAttribute("data-rule", rule)
  if (tooltip) match.setAttribute("title", tooltip)
  if (tooltip) match.setAttribute("data-desc", tooltip)
  const after = document.createTextNode(text.slice(end))
  node.replaceWith(before, match, after)
}

export default wrapMatch;