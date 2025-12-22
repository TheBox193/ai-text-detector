import SENTENCE_TARGETS from "~targets/sentenceTargets"
import { shouldSkipNode } from "~targets/skipTargets"
import WORD_TARGETS_FULL from "~targets/wordTargets"

import wrapMatch from "./wrapMatch"

const esc = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const RX = new RegExp(
  WORD_TARGETS_FULL.slice().sort((a, b) => b.length - a.length).map(esc).join("|"),
  "gi"
)

const HIGHLIGHT_SELECTOR = ".hl-char, .hl-sentence"
const HIGHLIGHT_WRAPPER_ATTR = "data-highlight-wrapper"

const WORD_MATCH_SEVERITY = "low"
const WORD_MATCH_SEVERITY_LABEL = "Low"

type HighlightStyles = {
  sentence: string
  word: string
}

type HighlightCounts = {
  sentenceCount: number
  wordCount: number
}

const createWalkerForRoot = (root: Element) =>
  document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      shouldSkipNode(node)
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT
  })

const escapeAttribute = (value: string): string =>
  value.replace(/"/g, "&quot;")

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

export const clearPreviewHighlights = (root: Element) => {
  root
    .querySelectorAll<HTMLElement>(HIGHLIGHT_SELECTOR)
    .forEach((element) => unwrapElement(element))

  root
    .querySelectorAll<HTMLElement>(`[${HIGHLIGHT_WRAPPER_ATTR}]`)
    .forEach((wrapper) => unwrapElement(wrapper))
}

const runSentenceHighlight = (root: Element, style: string): number => {
  let count = 0

  for (const pattern of SENTENCE_TARGETS) {
    const walker = createWalkerForRoot(root)
    const nodes: Text[] = []
    for (let node; (node = walker.nextNode()); ) nodes.push(node as Text)

    for (const node of nodes) {
      const original = node.nodeValue
      const matches = [...original.matchAll(pattern.regex)]
      if (matches.length === 0) continue

      for (let i = matches.length - 1; i >= 0; i--) {
        const match = matches[i]
        count += 1
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

  return count
}

const runWordHighlight = (root: Element, style: string): number => {
  let count = 0

  const walker = createWalkerForRoot(root)
  const nodes: Text[] = []
  for (let node; (node = walker.nextNode()); ) nodes.push(node as Text)

  for (const node of nodes) {
    const html = node.nodeValue.replace(
      RX,
      (match) => {
        count += 1
        return `<span class="hl-char" data-detection="word" data-severity="${WORD_MATCH_SEVERITY}" data-severity-label="${WORD_MATCH_SEVERITY_LABEL}" style="${escapeAttribute(style)}">${match}</span>`
      }
    )
    if (html !== node.nodeValue) {
      const wrapper = document.createElement("span")
      wrapper.innerHTML = html
      wrapper.setAttribute(HIGHLIGHT_WRAPPER_ATTR, "true")
      node.parentNode?.replaceChild(wrapper, node)
    }
  }

  return count
}

export const highlightPreviewRoot = (
  root: Element,
  styles: HighlightStyles
): HighlightCounts => {
  clearPreviewHighlights(root)
  const sentenceCount = runSentenceHighlight(root, styles.sentence)
  const wordCount = runWordHighlight(root, styles.word)
  return { sentenceCount, wordCount }
}

export default highlightPreviewRoot
