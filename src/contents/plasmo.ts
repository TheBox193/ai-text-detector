import type { PlasmoCSConfig } from "plasmo"

import {
  computeHighlightFragments,
  fetchHighlightSettings,
  isHighlightEnabledForSite,
  STORAGE_HIGHLIGHT_SETTINGS_KEY
} from "~utils/highlightSettings"
import wrapMatch from "~utils/wrapMatch"
import type {
  DetectionStats,
  DetectionType,
  SeverityLevel
} from "~types/detectionStats"

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

const SEVERITY_WEIGHTS: Record<SeverityLevel, number> = {
  low: 0.35,
  medium: 0.65,
  high: 1
}

const WORD_MATCH_SEVERITY: SeverityLevel = "low"
const DEFAULT_SENTENCE_WEIGHT = 0.6
const DEFAULT_WORD_WEIGHT = SEVERITY_WEIGHTS[WORD_MATCH_SEVERITY]
const MIN_CORE_TEXT_LENGTH = 160
const WORD_MATCH_SEVERITY_LABEL = "Low"
const CORE_CONTENT_SELECTORS = [
  "main[role='main']",
  "main",
  "[role='main']",
  "article[role='article']",
  "article",
  "#main-content",
  "#main",
  "#content",
  "#primary",
  ".main-content",
  ".article-content",
  ".post-content",
  ".entry-content",
  ".content"
]

const SEVERITY_INTENSITY_POINTS: Record<SeverityLevel, number> = {
  low: 0.65,
  medium: 1.35,
  high: 2.4
}

const WORD_INTENSITY_POINTS = 0.35

const normalizeWhitespace = (value: string): string =>
  value.replace(/\s+/g, " ").trim()

const escapeAttribute = (value: string): string =>
  value.replace(/"/g, "&quot;")

const countWordsFromNormalized = (value: string): number =>
  value ? value.split(" ").length : 0

const isSeverityLevel = (value: string): value is SeverityLevel =>
  value === "low" || value === "medium" || value === "high"

const normalizeSeverityValue = (value?: string): SeverityLevel | null => {
  if (!value) return null
  const normalized = value.toLowerCase()
  if (normalized === "med") return "medium"
  if (isSeverityLevel(normalized)) return normalized
  return null
}

const getSeverityWeight = (
  severity: string | undefined,
  type: DetectionType
): number => {
  const normalized = normalizeSeverityValue(severity)
  if (normalized) {
    return SEVERITY_WEIGHTS[normalized]
  }
  return type === "word" ? DEFAULT_WORD_WEIGHT : DEFAULT_SENTENCE_WEIGHT
}

const buildSeverityBreakdown = (): Record<
  SeverityLevel | "unknown",
  number
> => ({
  low: 0,
  medium: 0,
  high: 0,
  unknown: 0
})

const getCoreContentRoot = (): Element | null => {
  for (const selector of CORE_CONTENT_SELECTORS) {
    const candidate = document.querySelector(selector)
    if (
      candidate instanceof HTMLElement &&
      normalizeWhitespace(candidate.textContent ?? "").length >=
        MIN_CORE_TEXT_LENGTH
    ) {
      return candidate
    }
  }

  if (document.body) return document.body
  if (document.documentElement instanceof HTMLElement) {
    return document.documentElement
  }
  return null
}

const createWalkerForRoot = (root: Element) =>
  document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) =>
      shouldSkipNode(n)
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT
  })

const computeCoreTotals = (
  root: Element | null
): { totalWords: number; totalCharacters: number } => {
  if (!root) {
    return { totalWords: 0, totalCharacters: 0 }
  }

  const walker = createWalkerForRoot(root)
  let totalWords = 0
  let totalCharacters = 0

  for (let node: Node | null; (node = walker.nextNode()); ) {
    const textNode = node as Text
    const normalized = normalizeWhitespace(textNode.nodeValue ?? "")
    if (!normalized) continue

    totalCharacters += normalized.length
    totalWords += countWordsFromNormalized(normalized)
  }

  return { totalWords, totalCharacters }
}

const computeDetectionStats = (): DetectionStats => {
  const highlightCount = document.querySelectorAll<HTMLElement>(
    HIGHLIGHT_SELECTOR
  ).length
  const severityBreakdown = buildSeverityBreakdown()
  const typeBreakdown: Record<DetectionType, number> = {
    sentence: 0,
    word: 0
  }

  const coreRoot = getCoreContentRoot()
  if (!coreRoot) {
    return {
      totalWords: 0,
      totalCharacters: 0,
      flaggedWords: 0,
      flaggedCharacters: 0,
      rawCoverage: 0,
      weightedCoverage: 0,
      scorePercent: 0,
      weightedCoveragePercent: 0,
      rawCoveragePercent: 0,
      detectionPoints: 0,
      pointsPer100Words: 0,
      highSeverityDensity: 0,
      uniqueDensity: 0,
      detectionIntensity: 0,
      confidence: 0,
      confidencePercent: 0,
      highlightCount,
      uniqueDetections: 0,
      severityBreakdown,
      typeBreakdown,
      coreNodeTag: "none"
    }
  }

  const { totalWords, totalCharacters } = computeCoreTotals(coreRoot)
  let flaggedWords = 0
  let flaggedCharacters = 0
  let weightedSum = 0
  let uniqueDetections = 0
  let detectionPoints = 0

  const sentenceMatches = Array.from(
    coreRoot.querySelectorAll<HTMLElement>(".hl-sentence")
  )
  for (const element of sentenceMatches) {
    const text = normalizeWhitespace(element.textContent ?? "")
    if (!text) continue

    const words = Math.max(countWordsFromNormalized(text), 1)
    const severityLevel = normalizeSeverityValue(element.dataset.severity)
    const weight = getSeverityWeight(severityLevel ?? undefined, "sentence")
    const appliedSeverity: SeverityLevel =
      severityLevel ?? "medium"
    detectionPoints += SEVERITY_INTENSITY_POINTS[appliedSeverity]

    if (severityLevel) {
      severityBreakdown[severityLevel] += 1
    } else {
      severityBreakdown.unknown += 1
    }

    typeBreakdown.sentence += 1
    uniqueDetections += 1
    flaggedWords += words
    flaggedCharacters += text.length
    weightedSum += words * weight
  }

  const wordMatches = Array.from(
    coreRoot.querySelectorAll<HTMLElement>(".hl-char")
  )
  for (const element of wordMatches) {
    if (element.closest(".hl-sentence")) continue

    const text = normalizeWhitespace(element.textContent ?? "")
    if (!text) continue

    const words = Math.max(countWordsFromNormalized(text), 1)
    const severityValue =
      normalizeSeverityValue(element.dataset.severity) ?? WORD_MATCH_SEVERITY
    const weight = getSeverityWeight(severityValue, "word")
    detectionPoints += WORD_INTENSITY_POINTS

    severityBreakdown[severityValue] += 1
    typeBreakdown.word += 1
    uniqueDetections += 1
    flaggedWords += words
    flaggedCharacters += text.length
    weightedSum += words * weight
  }

  const rawCoverage =
    totalWords > 0 ? Math.min(flaggedWords / totalWords, 1) : 0
  const weightedCoverage =
    totalWords > 0 ? Math.min(weightedSum / totalWords, 1) : 0
  const weightedCoveragePercent = Math.round(weightedCoverage * 1000) / 10
  const rawCoveragePercent = Math.round(rawCoverage * 1000) / 10

  const wordsPerHundred = totalWords > 0 ? totalWords / 100 : 1
  const pointsPer100Words = detectionPoints / wordsPerHundred
  const highSeverityDensity =
    totalWords > 0
      ? severityBreakdown.high / Math.max(1, totalWords / 180)
      : severityBreakdown.high
  const uniqueDensity =
    totalWords > 0
      ? uniqueDetections / Math.max(1, totalWords / 120)
      : uniqueDetections

  const detectionIntensity =
    weightedCoverage * 6 +
    pointsPer100Words * 0.28 +
    highSeverityDensity * 0.72 +
    uniqueDensity * 0.18
  const confidence = Math.max(
    0,
    Math.min(1, 1 - Math.exp(-0.85 * Math.max(detectionIntensity, 0)))
  )
  const confidencePercent = Math.round(confidence * 1000) / 10

  return {
    totalWords,
    totalCharacters,
    flaggedWords,
    flaggedCharacters,
    rawCoverage,
    weightedCoverage,
    scorePercent: weightedCoveragePercent,
    weightedCoveragePercent,
    rawCoveragePercent,
    detectionPoints,
    pointsPer100Words,
    highSeverityDensity,
    uniqueDensity,
    detectionIntensity,
    confidence,
    confidencePercent,
    highlightCount,
    uniqueDetections,
    severityBreakdown,
    typeBreakdown,
    coreNodeTag:
      coreRoot instanceof HTMLElement
        ? coreRoot.tagName.toLowerCase()
        : "unknown"
  }
}

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
  const example = target.dataset.example
  if (!description && !severityLabel && !example) {
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
    text.style.fontSize = "14px"
    text.style.fontWeight = "500"
    text.style.color = "#f1f5f9"
    text.style.marginBottom = example ? "8px" : "0"
    el.appendChild(text)
  }

  if (example) {
    const sampleWrap = document.createElement("div")
    sampleWrap.style.background = "rgba(15, 23, 42, 0.55)"
    sampleWrap.style.border = "1px solid rgba(148, 163, 184, 0.4)"
    sampleWrap.style.borderRadius = "6px"
    sampleWrap.style.padding = "8px 10px"
    sampleWrap.style.fontSize = "13px"
    sampleWrap.style.lineHeight = "1.5"
    sampleWrap.style.color = "#e2e8f0"

    const sampleLabel = document.createElement("div")
    sampleLabel.textContent = "Example"
    sampleLabel.style.fontSize = "11px"
    sampleLabel.style.letterSpacing = "0.08em"
    sampleLabel.style.textTransform = "uppercase"
    sampleLabel.style.color = "#94a3b8"
    sampleLabel.style.marginBottom = "4px"

    const sampleText = document.createElement("div")
    sampleText.textContent = example

    sampleWrap.appendChild(sampleLabel)
    sampleWrap.appendChild(sampleText)
    el.appendChild(sampleWrap)
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
          pattern.severity,
          pattern.examples?.[0]
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
        `<span class="hl-char" data-detection="word" data-severity="${WORD_MATCH_SEVERITY}" data-severity-label="${WORD_MATCH_SEVERITY_LABEL}" style="${escapeAttribute(style)}">${match}</span>`
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

let latestStats: DetectionStats | null = null

const sendMatchStats = (stats: DetectionStats) => {
  latestStats = stats
  chrome.runtime.sendMessage({
    type: "MATCH_STATS",
    count: stats.highlightCount,
    stats
  })
}

const highlightDocument = (
  styles: ReturnType<typeof computeHighlightFragments>
): DetectionStats => {
  runSentenceHighlight(styles.sentence)
  runWordHighlight(styles.word)
  const stats = computeDetectionStats()
  latestStats = stats
  return stats
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
    const stats = computeDetectionStats()
    sendMatchStats(stats)
    return
  }

  clearHighlights()
  const stats = highlightDocument(styles)
  sendMatchStats(stats)
}

const getLatestStats = (): DetectionStats => {
  if (latestStats) {
    return latestStats
  }
  const stats = computeDetectionStats()
  latestStats = stats
  return stats
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

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (
    message.type === "GET_MATCH_COUNT" ||
    message.type === "GET_MATCH_STATS"
  ) {
    const stats = getLatestStats()
    sendMatchStats(stats)
    sendResponse({ stats })
    return false
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
