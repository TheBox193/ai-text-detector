import type { PlasmoCSConfig } from "plasmo"

import wrapMatch from "~utils/wrapMatch"

import SENTENCE_TARGETS from "../targets/sentenceTargets"
import { shouldSkipNode } from "../targets/skipTargets"
import WORD_TARGETS_FULL from "../targets/wordTargets"

export const config: PlasmoCSConfig = {
  matches: ["https://*/*"],
  run_at: "document_idle"
}

const STYLE = "background:#ff1493;color:#fff;padding:0 2px;border-radius:5px;"
const SENTENCE_STYLE =
  "background:#f9c74f;color:#FFF;padding:0 2px;border-radius:5px;"

/* build one regex (longest first to avoid "..."/".") -------------------- */
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const RX = new RegExp(
  WORD_TARGETS_FULL.sort((a, b) => b.length - a.length)
    .map(esc)
    .join("|"),
  "gi"
)

window.addEventListener("load", () => {
  console.log("hello")

  const walker1 = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (n) =>
        shouldSkipNode(n) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    }
  )

  const nodes1: Text[] = []
  for (let n; (n = walker1.nextNode()); ) nodes1.push(n as Text)

  // Pass 1: Sentence-level regex matches
    for (const pattern of SENTENCE_TARGETS) {
    // Get fresh nodes for each pattern
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (n) =>
          shouldSkipNode(n) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
      }
    )

    const nodes = []
    for (let n; (n = walker.nextNode()); ) nodes.push(n as Text)

    for (const node of nodes) {
      const original = node.nodeValue
      const matches = [...original.matchAll(pattern.regex)]
      if (matches.length === 0) continue
      
      for (let i = matches.length - 1; i >= 0; i--) {
        const m = matches[i];
        console.log({regex: pattern.regex, name: pattern.name, description: pattern.description})
        wrapMatch(
          node,
          m.index!,
          m.index! + m[0].length,
          "hl-sentence",
          SENTENCE_STYLE,
          pattern.name,
          pattern.description
        )
      }
    }
  }
  // Pass 2: Word-level TARGETS match (skip already highlighted spans)
  const walker2 = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (n) =>
        shouldSkipNode(n) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    }
  )

  const nodes2: Text[] = []
  for (let n; (n = walker2.nextNode()); ) nodes2.push(n as Text)

  for (const node of nodes2) {
    const html = node.nodeValue.replace(RX, (m) => {
      return `<span class="hl-char" style="${STYLE}">${m}</span>`
    })
    if (html !== node.nodeValue) {
      const wrapper = document.createElement("span")
      wrapper.innerHTML = html
      node.parentNode?.replaceChild(wrapper, node)
    }
  }

  const matchCount = document.querySelectorAll(".hl-char, .hl-sentence").length

  chrome.runtime.sendMessage({ type: "MATCH_COUNT", count: matchCount })
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GET_MATCH_COUNT") {
      const count = document.querySelectorAll(".hl-char, .hl-sentence").length
      chrome.runtime.sendMessage({ type: "MATCH_COUNT", count })
    }
  })
})
