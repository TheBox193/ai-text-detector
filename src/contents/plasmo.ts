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
          pattern.description
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
