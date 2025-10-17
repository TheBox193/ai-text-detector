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

import "./popup.css"

type ActiveTab = {
  id: number
  hostname: string
}

const toggleMessage = { type: "REFRESH_HIGHLIGHT_STATE" }

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

  return (
    <div className="popup-root">
      <header className="popup-header">
        <h1>AI Text Detector</h1>
        <p>Control how highlights appear while you browse.</p>
      </header>

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

      <footer className="popup-footer">
        Crafted by @TheBox193 · Stay curious!
      </footer>
    </div>
  )
}

export default IndexPopup
