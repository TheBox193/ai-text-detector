type SeverityDetails = {
  label: string
  value: string
}

const normalizeSeverity = (severity?: string): SeverityDetails | null => {
  if (!severity) return null
  const normalized = severity.toLowerCase()
  if (normalized === "med" || normalized === "medium") {
    return { label: "Medium", value: "medium" }
  }
  if (normalized === "low" || normalized === "high") {
    return {
      label: normalized.charAt(0).toUpperCase() + normalized.slice(1),
      value: normalized
    }
  }
  return { label: severity, value: normalized }
}

function wrapMatch(
  node: Text,
  start: number,
  end: number,
  className: string,
  style: string,
  rule?: string,
  tooltip?: string,
  severity?: string,
  example?: string
) {
  const text = node.nodeValue
  const before = document.createTextNode(text.slice(0, start))
  const match = document.createElement("span")
  match.className = className
  match.textContent = text.slice(start, end)
  match.style.cssText = style
  match.style.cursor = "help"
  if (rule) match.setAttribute("data-rule", rule)
  const severityDetails = normalizeSeverity(severity)
  if (tooltip) {
    match.dataset.desc = tooltip
  }
  if (example) {
    match.dataset.example = example
  }
  if (severityDetails) {
    match.dataset.severity = severityDetails.value
    match.dataset.severityLabel = severityDetails.label
  }
  const after = document.createTextNode(text.slice(end))
  node.replaceWith(before, match, after)
}

export default wrapMatch;
