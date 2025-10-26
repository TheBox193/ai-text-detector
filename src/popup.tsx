import { useEffect, useMemo, useState } from "react"

import {
  HighlightSettings,
  STORAGE_HIGHLIGHT_SETTINGS_KEY,
  clearGlobalPause,
  fetchHighlightSettings,
  getGlobalPauseRemainingMs,
  isHighlightEnabledForSite,
  setGlobalPauseMinutes,
  setSiteHighlightState
} from "~utils/highlightSettings"
import type { DetectionStats } from "~types/detectionStats"

import "./popup.css"

type ActiveTab = {
  id: number
  hostname: string
}

const toggleMessage = { type: "REFRESH_HIGHLIGHT_STATE" }

const formatNumber = (value?: number | null): string => {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "0"
  }
  return value.toLocaleString()
}

const formatScoreValue = (value?: number | null): string => {
  if (value === undefined || value === null || !Number.isFinite(value)) {
    return "--"
  }
  const rounded = Math.round(value * 10) / 10
  return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1)
}

const formatRatioPercent = (ratio?: number | null, digits = 1): string => {
  if (ratio === undefined || ratio === null || !Number.isFinite(ratio)) {
    return "0%"
  }
  return `${(ratio * 100).toFixed(digits)}%`
}

const SEVERITY_ORDER = [
  { key: "high", label: "High" },
  { key: "medium", label: "Medium" },
  { key: "low", label: "Low" }
] as const

const formatDuration = (ms: number): string => {
  const totalMinutes = Math.ceil(ms / 60_000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours && minutes) return `${hours}h ${minutes}m`
  if (hours) return `${hours}h`
  return `${Math.max(minutes, 1)}m`
}

function IndexPopup() {
  const [tab, setTab] = useState<ActiveTab | null>(null)
  const [settings, setSettings] = useState<HighlightSettings | null>(null)
  const [stats, setStats] = useState<DetectionStats | null>(null)
  const [siteEnabled, setSiteEnabled] = useState(true)
  const [sitePending, setSitePending] = useState(false)
  const [globalPending, setGlobalPending] = useState(false)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const active = tabs[0]
      if (!active?.id || !active.url) {
        setTab(null)
        return
      }

      try {
        const url = new URL(active.url)
        setTab({ id: active.id, hostname: url.hostname })
      } catch {
        setTab({ id: active.id, hostname: "" })
      }
    })
  }, [])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now())
    }, 1_000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const current = await fetchHighlightSettings()
      if (!mounted) return
      setSettings(current)
      if (tab?.hostname) {
        setSiteEnabled(
          isHighlightEnabledForSite(current, tab.hostname)
        )
      }
    }
    load()

    return () => {
      mounted = false
    }
  }, [tab?.hostname])

  useEffect(() => {
    if (!tab?.id) {
      setStats(null)
      return
    }

    chrome.runtime.sendMessage(
      { type: "REQUEST_PAGE_STATS", tabId: tab.id },
      (response: { stats?: DetectionStats | null } | undefined) => {
        if (chrome.runtime.lastError) {
          setStats(null)
          return
        }
        setStats(response?.stats ?? null)
      }
    )
  }, [tab?.id])

  useEffect(() => {
    const listener: Parameters<
      typeof chrome.storage.onChanged.addListener
    >[0] = (changes, area) => {
      if (area !== "local") return
      if (!changes[STORAGE_HIGHLIGHT_SETTINGS_KEY]) return

      fetchHighlightSettings().then((next) => {
        setSettings(next)
        if (tab?.hostname) {
          setSiteEnabled(
            isHighlightEnabledForSite(next, tab.hostname)
          )
        }
      })
    }

    chrome.storage.onChanged.addListener(listener)
    return () => {
      chrome.storage.onChanged.removeListener(listener)
    }
  }, [tab?.hostname])

  useEffect(() => {
    const listener: Parameters<
      typeof chrome.runtime.onMessage.addListener
    >[0] = (message) => {
      const payload = message as {
        type?: string
        stats?: DetectionStats
      }

      if (payload.type === "MATCH_STATS" && payload.stats) {
        setStats(payload.stats)
      }
    }

    chrome.runtime.onMessage.addListener(listener)
    return () => {
      chrome.runtime.onMessage.removeListener(listener)
    }
  }, [])

  const pauseRemainingMs = useMemo(
    () =>
      settings
        ? getGlobalPauseRemainingMs(settings, now)
        : 0,
    [settings, now]
  )

  const pauseActive = pauseRemainingMs > 0

  const notifyActiveTab = () => {
    if (!tab?.id) return
    chrome.tabs.sendMessage(
      tab.id,
      toggleMessage,
      () => {
        void chrome.runtime.lastError
      }
    )
  }

  const handleToggleSite = async () => {
    if (!tab?.hostname || sitePending) return
    setSitePending(true)
    try {
      const updated = await setSiteHighlightState(
        tab.hostname,
        !siteEnabled
      )
      setSettings(updated)
      setSiteEnabled(
        isHighlightEnabledForSite(updated, tab.hostname)
      )
      notifyActiveTab()
    } finally {
      setSitePending(false)
    }
  }

  const handlePause = async (minutes: number) => {
    if (globalPending) return
    setGlobalPending(true)
    try {
      const updated = await setGlobalPauseMinutes(minutes)
      setSettings(updated)
      notifyActiveTab()
    } finally {
      setGlobalPending(false)
    }
  }

  const handleResume = async () => {
    if (globalPending) return
    setGlobalPending(true)
    try {
      const updated = await clearGlobalPause()
      setSettings(updated)
      notifyActiveTab()
    } finally {
      setGlobalPending(false)
    }
  }

  const currentHostname =
    tab?.hostname && tab.hostname.length > 0
      ? tab.hostname
      : null

  const highlightCount = stats?.highlightCount ?? 0
  const flaggedWords = stats?.flaggedWords ?? 0
  const totalWords = stats?.totalWords ?? 0
  const uniqueDetections = stats?.uniqueDetections ?? 0
  const sentenceMatches = stats?.typeBreakdown.sentence ?? 0
  const wordMatches = stats?.typeBreakdown.word ?? 0
  const scopeLabel =
    stats?.coreNodeTag && stats.coreNodeTag !== "none"
      ? `${stats.coreNodeTag} section`
      : "page body"
  const confidenceDisplay = `${formatScoreValue(stats?.confidencePercent)}%`
  const weightedCoverageDisplay = formatRatioPercent(
    stats?.weightedCoverage
  )
  const rawCoverageDisplay = formatRatioPercent(stats?.rawCoverage)
  const pointsPer100WordsDisplay = stats
    ? `${formatScoreValue(stats.pointsPer100Words)} pts/100w`
    : ""
  const showIntensityChip = Boolean(
    stats && stats.pointsPer100Words > 0.25
  )
  const detectionStatus =
    stats && highlightCount > 0
      ? `${highlightCount} indicator${highlightCount === 1 ? "" : "s"} highlighted`
      : stats
        ? "No indicators detected"
        : "Waiting for page data"
  const scoreSubtext = stats
    ? `${detectionStatus}. Focus on ${scopeLabel}. Coverage ${weightedCoverageDisplay} (raw ${rawCoverageDisplay}).`
    : "Open a webpage to measure AI indicators in the main content."

  const openSettings = () => {
    if (typeof chrome.runtime.openOptionsPage === "function") {
      chrome.runtime.openOptionsPage()
    } else {
      chrome.tabs.create({ url: chrome.runtime.getURL("options.html") })
    }
  }

  return (
    <div className="popup-root">
      <header className="popup-header">
        <h1>AI Text Detector</h1>
        <p>Control how highlights appear while you browse.</p>
      </header>

      <section className="card score-card">
        <div className="score-header">
          <div>
            <h2>AI Confidence</h2>
            <p className="muted">
              Estimated likelihood this page leans on AI-generated writing.
            </p>
          </div>
          <div className="score-value">{confidenceDisplay}</div>
        </div>
        <p className="score-subtext">{scoreSubtext}</p>
        {stats ? (
          <>
            <div className="metric-grid">
              <div className="metric-card">
                <span className="metric-label">Flagged words</span>
                <span className="metric-value">
                  {formatNumber(flaggedWords)}
                </span>
                <span className="metric-sub">
                  of {formatNumber(totalWords)} total
                </span>
              </div>
              <div className="metric-card">
                <span className="metric-label">Detections</span>
                <span className="metric-value">
                  {formatNumber(uniqueDetections)}
                </span>
                <span className="metric-sub">
                  {formatNumber(sentenceMatches)} sentence ·{" "}
                  {formatNumber(wordMatches)} word
                </span>
              </div>
              <div className="metric-card metric-span">
                <span className="metric-label">Coverage</span>
                <span className="metric-value">{weightedCoverageDisplay}</span>
                <span className="metric-sub">
                  Weighted match share · raw {rawCoverageDisplay}
                </span>
              </div>
            </div>
            <div className="severity-chips">
              {showIntensityChip ? (
                <span className="severity-chip intensity-chip">
                  <span className="severity-dot" />
                  {pointsPer100WordsDisplay}
                </span>
              ) : null}
              {SEVERITY_ORDER.map(({ key, label }) => {
                const count = stats.severityBreakdown[key] ?? 0
                if (count === 0) return null
                return (
                  <span key={key} className={`severity-chip severity-${key}`}>
                    <span className="severity-dot" />
                    {label} · {formatNumber(count)}
                  </span>
                )
              })}
              {stats.severityBreakdown.unknown > 0 && (
                <span className="severity-chip severity-unknown">
                  <span className="severity-dot" />
                  Other · {formatNumber(stats.severityBreakdown.unknown)}
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="score-placeholder">
            <span>Browse to a readable page to analyze AI indicators.</span>
          </div>
        )}
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <h2>Current Site</h2>
            <p className="muted">
              {currentHostname
                ? `Highlight matches on ${currentHostname}`
                : "Open a webpage to manage site preferences."}
            </p>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              onChange={handleToggleSite}
              checked={siteEnabled}
              disabled={!currentHostname || sitePending || !settings}
            />
            <span className="slider" />
          </label>
        </div>
        {!currentHostname && (
          <p className="note">
            The toggle is disabled on internal or restricted tabs.
          </p>
        )}
      </section>

      <section className="card">
        <div className="card-header">
          <h2>Global Pause</h2>
          <span className={`status ${pauseActive ? "paused" : "active"}`}>
            {pauseActive
              ? `Paused (${formatDuration(pauseRemainingMs)} left)`
              : "Active"}
          </span>
        </div>
        <p className="muted">
          Temporarily disable highlighting on every site.
        </p>
        <div className="button-grid">
          {[15, 30, 60].map((minutes) => (
            <button
              key={minutes}
              onClick={() => handlePause(minutes)}
              className="pill-button"
              disabled={globalPending}
            >
              Pause {minutes}m
            </button>
          ))}
        </div>
        {pauseActive && (
          <button
            className="link-button"
            onClick={handleResume}
            disabled={globalPending}
          >
            Resume now
          </button>
        )}
      </section>

      <section className="card settings-card">
        <div className="card-header">
          <div>
            <h2>Styling</h2>
            <p className="muted">
              Choose colors, intensity, or underline mode from the settings
              page.
            </p>
          </div>
          <button className="secondary-button" onClick={openSettings}>
            Settings
          </button>
        </div>
      </section>

      <section className="card support-card">
        <h2>Support the Project</h2>
        <p className="muted">
          If the detector helps you spot AI writing faster, fuel the work with
          a coffee.
        </p>
        <a
          className="support-link"
          href="https://paypal.me/jstassen"
          target="_blank"
          rel="noopener noreferrer"
        >
          Buy me a coffee
        </a>
      </section>

      <footer className="popup-footer">
        Crafted by @TheBox193 · Stay curious!
      </footer>
    </div>
  )
}

export default IndexPopup
