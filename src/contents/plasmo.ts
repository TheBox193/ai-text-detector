import type { PlasmoCSConfig } from "plasmo"

import {
  computeHighlightFragments,
  fetchHighlightSettings,
  isHighlightEnabledForSite,
  STORAGE_HIGHLIGHT_SETTINGS_KEY
} from "~utils/highlightSettings"
import wrapMatch from "~utils/wrapMatch"

import SENTENCE_TARGETS from "../targets/sentenceTargets"
import { shouldSkipNode } from "../targets/skipTargets"
import WORD_TARGETS_FULL from "../targets/wordTargets"

export const config: PlasmoCSConfig = {
  matches: ["https://*/*"],
  run_at: "document_idle"
}

declare global {
  interface Window {
    __aiDetectorTooltipInit?: boolean
  }
}

/* build one regex (longest first to avoid "..."/".") -------------------- */
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const RX = new RegExp(
  WORD_TARGETS_FULL.sort((a, b) => b.length - a.length)
    .map(esc)
    .join("|"),
  "gi"
)

const HIGHLIGHT_SELECTOR = ".hl-char, .hl-sentence"
const HIGHLIGHT_WRAPPER_ATTR = "data-highlight-wrapper"

const TOOLTIP_ID = "__ai-detector-tooltip"
const TOOLTIP_MAX_WIDTH = 320
const TOOLTIP_MARGIN = 10

let tooltipElement: HTMLDivElement | null = null
let tooltipTarget: HTMLElement | null = null

const tooltipSeverityTokens: Record<
  string,
  { background: string; color: string; border: string }
> = {
  low: {
    background: "#dcfce7",
    color: "#166534",
    border: "#16a34a"
  },
  medium: {
    background: "#fef3c7",
    color: "#92400e",
    border: "#f59e0b"
  },
  high: {
    background: "#fee2e2",
    color: "#b91c1c",
    border: "#ef4444"
  },
  default: {
    background: "#e2e8f0",
    color: "#1f2937",
    border: "#94a3b8"
  }
}

const ensureTooltipElement = (): HTMLDivElement | null => {
  if (tooltipElement) return tooltipElement
  const container = document.body ?? document.documentElement
  if (!container) return null

  const el = document.createElement("div")
  el.id = TOOLTIP_ID
  el.style.position = "fixed"
  el.style.zIndex = "2147483646"
  el.style.pointerEvents = "none"
  el.style.background = "rgba(15, 23, 42, 0.94)"
  el.style.color = "#f8fafc"
  el.style.padding = "10px 12px"
  el.style.borderRadius = "8px"
  el.style.boxShadow = "0 12px 32px rgba(15, 23, 42, 0.28)"
  el.style.fontFamily =
    '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
  el.style.fontSize = "13px"
  el.style.lineHeight = "1.55"
  el.style.maxWidth = `${TOOLTIP_MAX_WIDTH}px`
  el.style.opacity = "0"
  el.style.visibility = "hidden"
  el.style.display = "block"
  el.style.transform = "translateY(4px)"
  el.style.transition = "opacity 120ms ease-out, transform 120ms ease-out"
  container.appendChild(el)
  tooltipElement = el
  return tooltipElement
}

const renderTooltipContent = (target: HTMLElement): HTMLDivElement | null => {
  const description = target.dataset.desc
  const severity = target.dataset.severity
  const severityLabel = target.dataset.severityLabel
  if (!description && !severityLabel) {
    return null
  }

  const el = ensureTooltipElement()
  if (!el) return null

  el.textContent = ""

  if (severityLabel) {
    const badge = document.createElement("div")
    const token =
      tooltipSeverityTokens[severity ?? ""] ?? tooltipSeverityTokens.default
    badge.textContent = severityLabel
    badge.style.display = "inline-flex"
    badge.style.alignItems = "center"
    badge.style.justifyContent = "center"
    badge.style.fontSize = "10px"
    badge.style.fontWeight = "600"
    badge.style.letterSpacing = "0.06em"
    badge.style.textTransform = "uppercase"
    badge.style.padding = "2px 8px"
    badge.style.borderRadius = "999px"
    badge.style.background = token.background
    badge.style.color = token.color
    badge.style.border = `1px solid ${token.border}`
    badge.style.marginBottom = description ? "6px" : "0"
    el.appendChild(badge)
  }

  if (description) {
    const text = document.createElement("div")
    text.textContent = description
    text.style.whiteSpace = "normal"
    text.style.wordBreak = "break-word"
    text.style.fontSize = "13px"
    text.style.color = "#f1f5f9"
    el.appendChild(text)
  }

  return el
}

const positionTooltip = (target: HTMLElement, tooltip: HTMLDivElement) => {
  const rect = target.getBoundingClientRect()
  const { offsetWidth, offsetHeight } = tooltip

  let top = rect.bottom + TOOLTIP_MARGIN
  if (top + offsetHeight > window.innerHeight - 8) {
    top = rect.top - offsetHeight - TOOLTIP_MARGIN
  }

  let left = rect.left + rect.width / 2 - offsetWidth / 2
  const minLeft = 8
  const maxLeft = window.innerWidth - offsetWidth - 8
  left = Math.max(minLeft, Math.min(left, maxLeft))

  tooltip.style.top = `${Math.round(top)}px`
  tooltip.style.left = `${Math.round(left)}px`
}

const hideTooltip = () => {
  if (!tooltipElement) return
  tooltipElement.style.opacity = "0"
  tooltipElement.style.transform = "translateY(4px)"
  tooltipElement.style.visibility = "hidden"
  tooltipTarget = null
}

const showTooltipForTarget = (target: HTMLElement) => {
  if (tooltipTarget === target) return
  const tooltip = renderTooltipContent(target)
  if (!tooltip) {
    hideTooltip()
    return
  }

  tooltip.style.opacity = "0"
  tooltip.style.visibility = "hidden"
  tooltip.style.transform = "translateY(4px)"

  positionTooltip(target, tooltip)

  tooltip.style.visibility = "visible"
  tooltip.style.opacity = "1"
  tooltip.style.transform = "translateY(0)"
  tooltipTarget = target
}

const handleTooltipMouseOver = (event: MouseEvent) => {
  const target = (event.target as HTMLElement | null)?.closest(
    ".hl-sentence"
  ) as HTMLElement | null
  if (!target) return
  showTooltipForTarget(target)
}

const handleTooltipMouseOut = (event: MouseEvent) => {
  const target = event.target as HTMLElement | null
  if (!target?.matches(".hl-sentence")) return
  const next = event.relatedTarget as HTMLElement | null
  if (next && next.closest(".hl-sentence") === target) return
  hideTooltip()
}

const handleTooltipScroll = () => {
  if (!tooltipTarget) return
  hideTooltip()
}

const handleTooltipKeyDown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    hideTooltip()
  }
}

const initTooltipInteraction = () => {
  if (window.__aiDetectorTooltipInit) return
  window.__aiDetectorTooltipInit = true

  document.addEventListener("mouseover", handleTooltipMouseOver)
  document.addEventListener("mouseout", handleTooltipMouseOut)
  document.addEventListener("click", hideTooltip, true)
  window.addEventListener("scroll", handleTooltipScroll, true)
  window.addEventListener("keydown", handleTooltipKeyDown, true)
}

initTooltipInteraction()

const createWalker = () =>
  document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) =>
      shouldSkipNode(n)
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT
  })

const runSentenceHighlight = (style: string) => {
  for (const pattern of SENTENCE_TARGETS) {
    const walker = createWalker()
    const nodes: Text[] = []
    for (let n; (n = walker.nextNode()); ) nodes.push(n as Text)

    for (const node of nodes) {
      const original = node.nodeValue
      const matches = [...original.matchAll(pattern.regex)]
      if (matches.length === 0) continue

      for (let i = matches.length - 1; i >= 0; i--) {
        const match = matches[i]
        wrapMatch(
          node,
          match.index!,
          match.index! + match[0].length,
          "hl-sentence",
          style,
          pattern.name,
          pattern.description,
          pattern.severity
        )
      }
    }
  }
}

const runWordHighlight = (style: string) => {
  const walker = createWalker()
  const nodes: Text[] = []
  for (let n; (n = walker.nextNode()); ) nodes.push(n as Text)

  for (const node of nodes) {
    const html = node.nodeValue.replace(
      RX,
      (match) =>
        `<span class="hl-char" style="${style}">${match}</span>`
    )
    if (html !== node.nodeValue) {
      const wrapper = document.createElement("span")
      wrapper.innerHTML = html
      wrapper.setAttribute(HIGHLIGHT_WRAPPER_ATTR, "true")
      node.parentNode?.replaceChild(wrapper, node)
    }
  }
}

const unwrapElement = (element: HTMLElement) => {
  const parent = element.parentNode
  if (!parent) return

  if (element.childNodes.length === 0) {
    parent.replaceChild(
      document.createTextNode(element.textContent ?? ""),
      element
    )
    ;(parent as ParentNode).normalize()
    return
  }

  while (element.firstChild) {
    parent.insertBefore(element.firstChild, element)
  }

  parent.removeChild(element)
  ;(parent as ParentNode).normalize()
}

const clearHighlights = () => {
  hideTooltip()
  document
    .querySelectorAll<HTMLElement>(HIGHLIGHT_SELECTOR)
    .forEach((el) => unwrapElement(el))

  document
    .querySelectorAll<HTMLElement>(`[${HIGHLIGHT_WRAPPER_ATTR}]`)
    .forEach((wrapper) => unwrapElement(wrapper))
}

const sendMatchCount = (count: number) => {
  chrome.runtime.sendMessage({ type: "MATCH_COUNT", count })
}

const highlightDocument = (
  styles: ReturnType<typeof computeHighlightFragments>
): number => {
  runSentenceHighlight(styles.sentence)
  runWordHighlight(styles.word)
  return document.querySelectorAll(HIGHLIGHT_SELECTOR).length
}

const refreshHighlight = async () => {
  if (!document?.body) return

  const settings = await fetchHighlightSettings()
  const styles = computeHighlightFragments(settings.style)
  const allowed = isHighlightEnabledForSite(
    settings,
    window.location.hostname
  )

  if (!allowed) {
    clearHighlights()
    sendMatchCount(0)
    return
  }

  clearHighlights()
  const count = highlightDocument(styles)
  sendMatchCount(count)
}

const handleMatchCountRequest = () => {
  const count = document.querySelectorAll(HIGHLIGHT_SELECTOR).length
  sendMatchCount(count)
}

const isDomReady =
  document.readyState === "complete" || document.readyState === "interactive"

if (isDomReady) {
  refreshHighlight()
} else {
  window.addEventListener("load", () => {
    refreshHighlight()
  })
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "GET_MATCH_COUNT") {
    handleMatchCountRequest()
  }
  if (message.type === "REFRESH_HIGHLIGHT_STATE") {
    refreshHighlight()
  }
})

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") return
  if (changes[STORAGE_HIGHLIGHT_SETTINGS_KEY]) {
    refreshHighlight()
  }
})
