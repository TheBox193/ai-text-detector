import { useEffect, useMemo, useRef, useState } from "react"

import type { HighlightStyleSettings } from "~utils/highlightSettings"
import {
  DEFAULT_STYLE_SETTINGS,
  STORAGE_HIGHLIGHT_SETTINGS_KEY,
  computeHighlightFragments,
  fetchHighlightSettings
} from "~utils/highlightSettings"
import {
  clearPreviewHighlights,
  highlightPreviewRoot
} from "~utils/highlightPreview"

import "./testerPlayground.css"

const SAMPLE_TEXT = `In today's digital age, it's important to consider how AI tools shape our writing. On the one hand, they unlock the secrets of productivity, but on the other hand, they can make everything sound the same.

That being said, a broader perspective reveals patterns that shed light on whether a paragraph feels synthetic. Paste your own text on the left to see which phrases the detector highlights.`

const INITIAL_COUNTS = { sentenceCount: 0, wordCount: 0 }

type TesterPlaygroundProps = {
  variant?: "standalone" | "embedded"
  showHeader?: boolean
}

const TesterPlayground = ({
  variant = "standalone",
  showHeader = true
}: TesterPlaygroundProps) => {
  const [input, setInput] = useState<string>(SAMPLE_TEXT)
  const [style, setStyle] =
    useState<HighlightStyleSettings>(DEFAULT_STYLE_SETTINGS)
  const [counts, setCounts] = useState(INITIAL_COUNTS)
  const previewRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      const settings = await fetchHighlightSettings()
      if (!active) return
      setStyle(settings.style)
    }
    load()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const listener: Parameters<typeof chrome.storage.onChanged.addListener>[0] = (
      changes,
      area
    ) => {
      if (area !== "local") return
      if (!changes[STORAGE_HIGHLIGHT_SETTINGS_KEY]) return
      fetchHighlightSettings().then((next) => {
        setStyle(next.style)
      })
    }
    chrome.storage.onChanged.addListener(listener)
    return () => {
      chrome.storage.onChanged.removeListener(listener)
    }
  }, [])

  const fragments = useMemo(
    () => computeHighlightFragments(style),
    [style]
  )

  const sentenceLegendStyle = useMemo(
    () =>
      fragments.mode === "underline"
        ? {
            textDecoration: "underline",
            textDecorationColor: fragments.sentenceColor,
            textDecorationThickness: fragments.underlineThickness,
            textUnderlineOffset: "0.24em",
            fontWeight: fragments.fontWeight
          }
        : {
            background: fragments.sentenceStyleMap.background,
            boxShadow: fragments.sentenceStyleMap.boxShadow,
            color: fragments.sentenceStyleMap.color,
            fontWeight: fragments.fontWeight
          },
    [fragments]
  )

  const wordLegendStyle = useMemo(
    () =>
      fragments.mode === "underline"
        ? {
            textDecoration: "underline",
            textDecorationColor: fragments.wordColor,
            textDecorationThickness: fragments.underlineThickness,
            textUnderlineOffset: "0.24em",
            fontWeight: fragments.fontWeight
          }
        : {
            background: fragments.wordStyleMap.background,
            boxShadow: fragments.wordStyleMap.boxShadow,
            color: fragments.wordStyleMap.color,
            fontWeight: fragments.fontWeight
          },
    [fragments]
  )

  useEffect(() => {
    const container = previewRef.current
    if (!container) return

    const trimmed = input.trim()
    container.textContent = input
    if (!trimmed) {
      clearPreviewHighlights(container)
      setCounts({ sentenceCount: 0, wordCount: 0 })
      return
    }

    const next = highlightPreviewRoot(container, {
      sentence: fragments.sentence,
      word: fragments.word
    })
    setCounts(next)
  }, [input, fragments])

  const totalHighlights = counts.sentenceCount + counts.wordCount
  const trimmed = input.trim()
  const rootClass = `tester-page tester-variant-${variant}`

  const loadSampleButton = (
    <button
      type="button"
      className="tester-reset"
      onClick={() => setInput(SAMPLE_TEXT)}
    >
      Load sample
    </button>
  )

  return (
    <div className={rootClass}>
      {showHeader ? (
        <header className="tester-header">
          <div>
            <h1>AI Text Detector Playground</h1>
            <p className="tester-subtitle">
              Paste text to preview how our highlight rules react in real time.
            </p>
          </div>
          {loadSampleButton}
        </header>
      ) : (
        <div className="tester-embedded-tools">{loadSampleButton}</div>
      )}

      <main className="tester-panels">
        <section className="tester-panel tester-panel-input">
          <label htmlFor="tester-input">Input Text</label>
          <textarea
            id="tester-input"
            spellCheck={false}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Paste or type any text here…"
          />
          <footer className="tester-input-meta">
            <span>{input.length.toLocaleString()} characters</span>
            <span>
              {input.split(/\s+/).filter(Boolean).length.toLocaleString()} words
            </span>
          </footer>
        </section>

        <section className="tester-panel tester-panel-preview">
          <div className="tester-preview-header">
            <h2>Detector Preview</h2>
            <div className="tester-highlight-legend">
              <span
                className="legend-chip legend-sentence"
                style={sentenceLegendStyle}
              >
                Sentence cue
              </span>
              <span
                className="legend-chip legend-word"
                style={wordLegendStyle}
              >
                Word cue
              </span>
            </div>
          </div>

          <div className="tester-preview-surface">
            <div
              ref={previewRef}
              className="tester-preview-content"
              style={{
                visibility: trimmed ? "visible" : "hidden"
              }}
            />
            {!trimmed && (
              <div className="tester-preview-empty">
                Paste text on the left to see highlighted matches.
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="tester-summary">
        <div className="tester-summary-item">
          <span className="tester-summary-label">Total highlights</span>
          <span className="tester-summary-value">
            {totalHighlights.toLocaleString()}
          </span>
        </div>
        <div className="tester-summary-item">
          <span className="tester-summary-label">Sentence patterns</span>
          <span className="tester-summary-value">
            {counts.sentenceCount.toLocaleString()}
          </span>
        </div>
        <div className="tester-summary-item">
          <span className="tester-summary-label">Word cues</span>
          <span className="tester-summary-value">
            {counts.wordCount.toLocaleString()}
          </span>
        </div>
      </footer>
    </div>
  )
}

export default TesterPlayground
