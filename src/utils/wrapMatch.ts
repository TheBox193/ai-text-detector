function wrapMatch(
  node: Text,
  start: number,
  end: number,
  className: string,
  style: string,
  rule?: string,
) {
  const text = node.nodeValue
  const before = document.createTextNode(text.slice(0, start))
  const match = document.createElement("span")
  match.className = className
  match.textContent = text.slice(start, end)
  match.style.cssText = style
  if (rule) match.setAttribute("data-rule", rule)
  const after = document.createTextNode(text.slice(end))
  node.replaceWith(before, match, after)
}

export default wrapMatch;