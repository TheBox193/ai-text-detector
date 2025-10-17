import type { CSSProperties } from "react"
import { useEffect, useMemo, useState } from "react"

import {
  DEFAULT_STYLE_SETTINGS,
  HighlightSettings,
  HighlightStyleSettings,
  computeHighlightFragments,
  fetchHighlightSettings,
  updateHighlightStyle
} from "~utils/highlightSettings"

import "./options.css"

const PRESET_PALETTES: Array<
  HighlightStyleSettings & { label: string; description: string }
> = [
  {
    paletteId: "sunset",
    wordColor: "#ff1493",
    sentenceColor: "#f97316",
    intensity: DEFAULT_STYLE_SETTINGS.intensity,
    mode: DEFAULT_STYLE_SETTINGS.mode,
    bold: DEFAULT_STYLE_SETTINGS.bold,
    label: "Sunset Pop",
    description: "Bold magenta words with warm sentence highlights."
  },
  {
    paletteId: "calm",
    wordColor: "#0ea5e9",
    sentenceColor: "#22c55e",
    intensity: "mid",
    mode: DEFAULT_STYLE_SETTINGS.mode,
    bold: DEFAULT_STYLE_SETTINGS.bold,
    label: "Calm Breeze",
    description: "Cool cyan terms with soft green sentence accents."
  },
  {
    paletteId: "mono",
    wordColor: "#334155",
    sentenceColor: "#64748b",
    intensity: "mid",
    mode: DEFAULT_STYLE_SETTINGS.mode,
    bold: DEFAULT_STYLE_SETTINGS.bold,
    label: "Slate Focus",
    description: "Monochrome slate palette for subdued contrast."
  },
  {
    paletteId: "contrast",
    wordColor: "#0f172a",
    sentenceColor: "#fbbf24",
    intensity: "bold",
    mode: DEFAULT_STYLE_SETTINGS.mode,
    bold: DEFAULT_STYLE_SETTINGS.bold,
    label: "High Contrast",
    description: "Deep navy keywords with golden sentence frames."
  }
]

const INTENSITY_VALUES: Array<HighlightStyleSettings["intensity"]> = [
  "soft",
  "mid",
  "bold"
]

const IndexOptions = () => {
  const [settings, setSettings] = useState<HighlightSettings | null>(null)
  const [style, setStyle] = useState<HighlightStyleSettings>(
    DEFAULT_STYLE_SETTINGS
  )
  const [pending, setPending] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      const current = await fetchHighlightSettings()
      if (!active) return
      setSettings(current)
      setStyle(current.style ?? DEFAULT_STYLE_SETTINGS)
    }
    load()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!status) return
    const timer = window.setTimeout(() => setStatus(null), 2000)
    return () => window.clearTimeout(timer)
  }, [status])

  const persistStyle = async (next: HighlightStyleSettings) => {
    setPending(true)
    try {
      const updated = await updateHighlightStyle(next)
      setSettings(updated)
      setStyle(updated.style)
      setStatus("Preferences updated")
    } finally {
      setPending(false)
    }
  }

  const handleSelectPalette = (paletteId: string) => {
    const match = PRESET_PALETTES.find((p) => p.paletteId === paletteId)
    if (!match) return
    const next: HighlightStyleSettings = {
      ...style,
      paletteId,
      wordColor: match.wordColor,
      sentenceColor: match.sentenceColor,
      intensity: match.intensity,
      mode: style.mode,
      bold: style.bold
    }
    void persistStyle(next)
  }

  const handleIntensityChange = (index: number) => {
    const intensity = INTENSITY_VALUES[index] ?? "bold"
    const next: HighlightStyleSettings = {
      ...style,
      intensity
    }
    void persistStyle(next)
  }

  const handleModeChange = (mode: HighlightStyleSettings["mode"]) => {
    const next: HighlightStyleSettings = {
      ...style,
      mode
    }
    void persistStyle(next)
  }

  const handleBoldToggle = (bold: boolean) => {
    const next: HighlightStyleSettings = {
      ...style,
      bold
    }
    void persistStyle(next)
  }

  const handleColorChange = (
    key: "wordColor" | "sentenceColor",
    value: string
  ) => {
    const next: HighlightStyleSettings = {
      ...style,
      paletteId: "custom",
      [key]: value
    }
    void persistStyle(next)
  }

  const intensityIndex = useMemo(
    () => Math.max(0, INTENSITY_VALUES.indexOf(style.intensity)),
    [style.intensity]
  )

  const fragments = useMemo(
    () => computeHighlightFragments(style),
    [style]
  )

  const previewWordStyle: CSSProperties =
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
          color: fragments.wordStyleMap.color,
          padding: "0 2px",
          borderRadius: fragments.wordStyleMap.borderRadius,
          boxShadow: fragments.wordStyleMap.boxShadow,
          fontWeight: fragments.fontWeight
        }

  const previewSentenceStyle: CSSProperties =
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
          color: fragments.sentenceStyleMap.color,
          padding: "0 2px",
          borderRadius: fragments.sentenceStyleMap.borderRadius,
          boxShadow: fragments.sentenceStyleMap.boxShadow,
          fontWeight: fragments.fontWeight
        }

  return (
    <div className="options-root">
      {status && (
        <div id="status-toast" className="visible" aria-live="polite">
          {status}
        </div>
      )}
      <header className="options-header">
        <h1>AI Text Detector Preferences</h1>
        <p>Dial in the styling that works best for your reading flow.</p>
      </header>

      <section className="options-card">
        <div className="card-title">
          <h2>Palette Presets</h2>
          <p className="muted">
            Pick a starting point for word and sentence highlights.
          </p>
        </div>
        <div className="palette-grid">
          {PRESET_PALETTES.map((palette) => (
            <button
              key={palette.paletteId}
              className={`palette-card ${
                style.paletteId === palette.paletteId ? "selected" : ""
              }`}
              onClick={() => handleSelectPalette(palette.paletteId)}
              disabled={pending}
              type="button"
            >
              <div className="swatch-row">
                <span
                  className="swatch word"
                  style={{ backgroundColor: palette.wordColor }}
                />
                <span
                  className="swatch sentence"
                  style={{ backgroundColor: palette.sentenceColor }}
                />
              </div>
              <div>
                <h3>{palette.label}</h3>
                <p>{palette.description}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="options-card">
        <div className="card-title">
          <h2>Example Preview</h2>
          <p className="muted">
            Your current styling renders like this sample paragraph.
          </p>
        </div>
        <div
          className={`preview preview-${fragments.mode}`}
          data-mode={fragments.mode}
        >
          <p>
            <span
              className="preview-highlight preview-sentence"
              style={previewSentenceStyle}
            >
              That being said, it&apos;s important to consider how the polished
              tone stands apart from human nuance.
            </span>
          </p>
          <p>
            In today&apos;s digital age, teams reach for AI helpers that promise{" "}
            <span
              className="preview-highlight preview-word"
              style={previewWordStyle}
            >
              to unlock the secrets
            </span>{" "}
            of productivity, even when conversational fillers creep in.
          </p>
        </div>
      </section>

      <section className="options-card">
        <div className="card-title">
          <h2>Custom Colors</h2>
          <p className="muted">
            Prefer your own palette? Pick colors and we&apos;ll remember them.
          </p>
        </div>
        <div className="custom-grid">
          <label>
            <span className="color-label">Word matches</span>
            <input
              type="color"
              value={style.wordColor}
              onChange={(event) =>
                handleColorChange("wordColor", event.target.value)
              }
              disabled={pending}
            />
          </label>
          <label>
            <span className="color-label">Sentence matches</span>
            <input
              type="color"
              value={style.sentenceColor}
              onChange={(event) =>
                handleColorChange("sentenceColor", event.target.value)
              }
              disabled={pending}
            />
          </label>
        </div>
      </section>

      <section className="options-card">
        <div className="card-title">
          <h2>Highlight Impact</h2>
          <p className="muted">
            Adjust how strong the highlight appears on the page.
          </p>
        </div>
        <div className="slider-row">
          <span>Soft</span>
          <div className="slider-track">
            <input
              type="range"
              min={0}
              max={INTENSITY_VALUES.length - 1}
              step={1}
              value={intensityIndex}
              onChange={(event) =>
                handleIntensityChange(Number(event.target.value))
              }
              disabled={pending}
            />
          </div>
          <span>Bold</span>
        </div>
        <p className="muted">
          Current setting: <strong>{style.intensity.toUpperCase()}</strong>
        </p>
        <label className="bold-toggle">
          <input
            type="checkbox"
            className="checkbox-input"
            checked={style.bold !== false}
            onChange={(event) => handleBoldToggle(event.target.checked)}
            disabled={pending}
          />
          <span>Bold detected text</span>
        </label>
      </section>

      <section className="options-card">
        <div className="card-title">
          <h2>Display Mode</h2>
          <p className="muted">
            Prefer underlines instead of fills? Switch the detection style.
          </p>
        </div>
        <div className="mode-toggle">
          <label>
            <input
              type="radio"
              name="display-mode"
              checked={style.mode === "underline"}
              onChange={() => handleModeChange("underline")}
              disabled={pending}
            />
            <span>
              <strong>Underline Only</strong>
              <small>Keep text styling intact, just underline matches.</small>
            </span>
          </label>
          <label>
            <input
              type="radio"
              name="display-mode"
              checked={style.mode === "highlight"}
              onChange={() => handleModeChange("highlight")}
              disabled={pending}
            />
            <span>
              <strong>Color Highlight</strong>
              <small>Background fill with readable contrast.</small>
            </span>
          </label>
        </div>
      </section>

      <footer className="options-footer">
        <p>Crafted by @TheBox193.</p>
      </footer>
    </div>
  )
}

export default IndexOptions
