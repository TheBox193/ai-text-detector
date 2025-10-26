import type { DetectionStats } from "~types/detectionStats"

export {}

type TabStatsEntry = {
  stats: DetectionStats
  updatedAt: number
}

const tabStats = new Map<number, TabStatsEntry>()

const formatBadgeText = (stats: DetectionStats): string => {
  if (stats.highlightCount === 0 || stats.scorePercent <= 0) {
    return ""
  }

  const rounded = Math.round(stats.scorePercent)
  if (rounded >= 100) return "100"
  return `${rounded}%`
}

const pickBadgeColor = (stats: DetectionStats): string => {
  if (stats.scorePercent >= 60) return "#dc2626"
  if (stats.scorePercent >= 35) return "#f97316"
  return "#0ea5e9"
}

const clearBadge = (tabId: number) => {
  chrome.action.setBadgeText({ tabId, text: "" })
}

const applyBadge = (tabId: number, stats: DetectionStats | null) => {
  if (!stats || stats.highlightCount === 0 || stats.scorePercent <= 0) {
    clearBadge(tabId)
    return
  }

  chrome.action.setBadgeText({
    tabId,
    text: formatBadgeText(stats)
  })
  chrome.action.setBadgeBackgroundColor({
    tabId,
    color: pickBadgeColor(stats)
  })
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "MATCH_STATS") {
    const tabId = sender.tab?.id
    const stats = message.stats as DetectionStats | undefined
    if (typeof tabId !== "number" || !stats) {
      return
    }

    tabStats.set(tabId, { stats, updatedAt: Date.now() })
    applyBadge(tabId, stats)
    return
  }

  if (message.type === "REQUEST_PAGE_STATS") {
    const tabId =
      typeof message.tabId === "number" ? message.tabId : sender.tab?.id
    if (typeof tabId !== "number") {
      sendResponse({ stats: null })
      return false
    }

    const entry = tabStats.get(tabId)
    if (entry) {
      sendResponse({ stats: entry.stats })
      return false
    }

    chrome.tabs.sendMessage(
      tabId,
      { type: "GET_MATCH_STATS" },
      (response: { stats?: DetectionStats | null } | undefined) => {
        if (chrome.runtime.lastError) {
          sendResponse({ stats: null })
          return
        }

        const stats = response?.stats ?? null
        if (stats) {
          tabStats.set(tabId, { stats, updatedAt: Date.now() })
          applyBadge(tabId, stats)
        }
        sendResponse({ stats })
      }
    )
    return true
  }
})

chrome.tabs.onActivated.addListener(({ tabId }) => {
  const entry = tabStats.get(tabId)
  applyBadge(tabId, entry?.stats ?? null)

  chrome.tabs.sendMessage(
    tabId,
    { type: "GET_MATCH_STATS" },
    () => void chrome.runtime.lastError
  )
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "complete") {
    chrome.tabs.sendMessage(
      tabId,
      { type: "GET_MATCH_STATS" },
      () => void chrome.runtime.lastError
    )
  }
})

chrome.tabs.onRemoved.addListener((tabId) => {
  tabStats.delete(tabId)
})
