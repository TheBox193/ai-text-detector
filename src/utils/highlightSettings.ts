export type HighlightIntensity = "soft" | "mid" | "bold"
export type HighlightMode = "highlight" | "underline"

export type HighlightStyleSettings = {
  paletteId: string
  wordColor: string
  sentenceColor: string
  intensity: HighlightIntensity
  mode: HighlightMode
  bold?: boolean
}

export type HighlightSettings = {
  disabledSites: Record<string, boolean>
  globalDisabledUntil?: number
  style: HighlightStyleSettings
}

export const DEFAULT_STYLE_SETTINGS: HighlightStyleSettings = {
  paletteId: "sunset",
  wordColor: "#ff1493",
  sentenceColor: "#f97316",
  intensity: "bold",
  mode: "underline",
  bold: false
}

const STORAGE_KEY = "highlightSettings"

const getStorage = (): chrome.storage.LocalStorageArea | undefined => {
  try {
    return chrome?.storage?.local
  } catch {
    return undefined
  }
}

const withDefaults = (
  input?: Partial<HighlightSettings>
): HighlightSettings => ({
  disabledSites: {},
  ...input,
  disabledSites: { ...(input?.disabledSites ?? {}) },
  style: {
    ...DEFAULT_STYLE_SETTINGS,
    ...(input?.style ?? {})
  }
})

export const fetchHighlightSettings = async (): Promise<HighlightSettings> => {
  const storage = getStorage()
  if (!storage) {
    return withDefaults()
  }
  return new Promise((resolve) => {
    storage.get(STORAGE_KEY, (result) => {
      resolve(withDefaults(result[STORAGE_KEY]))
    })
  })
}

export const saveHighlightSettings = async (
  settings: HighlightSettings
): Promise<void> => {
  const storage = getStorage()
  if (!storage) {
    return
  }
  return new Promise((resolve) => {
    storage.set({ [STORAGE_KEY]: settings }, () => resolve())
  })
}

export const isHighlightEnabledForSite = (
  settings: HighlightSettings,
  hostname: string,
  now: number = Date.now()
): boolean => {
  const disabledUntil = settings.globalDisabledUntil ?? 0
  if (disabledUntil > now) {
    return false
  }

  if (!hostname) {
    return true
  }

  const disabledForSite = settings.disabledSites?.[hostname]
  return disabledForSite !== true
}

export const setSiteHighlightState = async (
  hostname: string,
  enabled: boolean
): Promise<HighlightSettings> => {
  const current = await fetchHighlightSettings()
  const next: HighlightSettings = {
    ...current,
    disabledSites: { ...current.disabledSites }
  }

  if (enabled) {
    delete next.disabledSites[hostname]
  } else {
    next.disabledSites[hostname] = true
  }

  await saveHighlightSettings(next)
  return next
}

export const setGlobalPauseMinutes = async (
  minutes: number
): Promise<HighlightSettings> => {
  const current = await fetchHighlightSettings()
  const pauseUntil = Date.now() + minutes * 60_000
  const next: HighlightSettings = {
    ...current,
    globalDisabledUntil: pauseUntil
  }
  await saveHighlightSettings(next)
  return next
}

export const clearGlobalPause = async (): Promise<HighlightSettings> => {
  const current = await fetchHighlightSettings()
  const next: HighlightSettings = {
    ...current,
    globalDisabledUntil: undefined
  }
  await saveHighlightSettings(next)
  return next
}

export const updateHighlightStyle = async (
  style: HighlightStyleSettings
): Promise<HighlightSettings> => {
  const current = await fetchHighlightSettings()
  const next: HighlightSettings = {
    ...current,
    style: {
      ...DEFAULT_STYLE_SETTINGS,
      ...style
    }
  }
  await saveHighlightSettings(next)
  return next
}

export const getGlobalPauseRemainingMs = (
  settings: HighlightSettings,
  now: number = Date.now()
): number => {
  const disabledUntil = settings.globalDisabledUntil ?? 0
  return Math.max(0, disabledUntil - now)
}

export const STORAGE_HIGHLIGHT_SETTINGS_KEY = STORAGE_KEY

type RGB = { r: number; g: number; b: number }

type HighlightIntensityConfig = {
  alpha: number
  fontWeight: number
  underlineThickness: string
}

const INTENSITY_CONFIG: Record<string, HighlightIntensityConfig> = {
  soft: { alpha: 0.25, fontWeight: 500, underlineThickness: "0.12em" },
  mid: { alpha: 0.45, fontWeight: 600, underlineThickness: "0.18em" },
  bold: { alpha: 0.72, fontWeight: 700, underlineThickness: "0.24em" }
}

const hexToRgb = (hex: string): RGB | null => {
  const value = hex.replace("#", "")
  const normalized =
    value.length === 3
      ? value
          .split("")
          .map((c) => c + c)
          .join("")
      : value
  const match = normalized.match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  if (!match) return null

  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16)
  }
}

const buildRgba = (rgb: RGB, alpha: number) =>
  `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha.toFixed(2)})`

const luminance = ({ r, g, b }: RGB) => {
  const [rr, gg, bb] = [r, g, b].map((v) => {
    const channel = v / 255
    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rr + 0.7152 * gg + 0.0722 * bb
}

const getReadableTextColor = (rgb: RGB) =>
  luminance(rgb) > 0.5 ? "#111827" : "#ffffff"

const toCssProp = (key: string) =>
  key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)

const mapToCssText = (styles: Record<string, string>) =>
  Object.entries(styles)
    .map(([key, value]) => `${toCssProp(key)}:${value}`)
    .join(";")

export const computeHighlightFragments = (
  style: HighlightStyleSettings = DEFAULT_STYLE_SETTINGS
): {
  word: string
  sentence: string
  mode: HighlightMode
  wordColor: string
  sentenceColor: string
  underlineThickness: string
  fontWeight: number
  wordStyleMap: Record<string, string>
  sentenceStyleMap: Record<string, string>
} => {
  const config =
    INTENSITY_CONFIG[style.intensity] ?? INTENSITY_CONFIG.bold
  const fontWeight = style.bold === false ? 500 : config.fontWeight

  const wordRgb = hexToRgb(style.wordColor) ?? hexToRgb("#ff1493")!
  const sentenceRgb =
    hexToRgb(style.sentenceColor) ?? hexToRgb("#f97316")!

  if (style.mode === "underline") {
    const wordStyleMap = {
      color: "inherit",
      background: "transparent",
      textDecoration: "underline",
      textDecorationColor: style.wordColor,
      textDecorationThickness: config.underlineThickness,
      textUnderlineOffset: "0.24em",
      fontWeight: String(fontWeight)
    }
    const sentenceStyleMap = {
      color: "inherit",
      background: "transparent",
      textDecoration: "underline",
      textDecorationColor: style.sentenceColor,
      textDecorationThickness: config.underlineThickness,
      textUnderlineOffset: "0.24em",
      fontWeight: String(fontWeight)
    }

    return {
      mode: "underline",
      wordColor: style.wordColor,
      sentenceColor: style.sentenceColor,
      underlineThickness: config.underlineThickness,
      fontWeight,
      wordStyleMap,
      sentenceStyleMap,
      word: mapToCssText(wordStyleMap),
      sentence: mapToCssText(sentenceStyleMap)
    }
  }

  const wordBg = buildRgba(wordRgb, config.alpha)
  const sentenceBg = buildRgba(sentenceRgb, config.alpha)
  const wordStyleMap = {
    background: wordBg,
    color: getReadableTextColor(wordRgb),
    padding: "0 2px",
    borderRadius: "5px",
    boxShadow: `0 0 0 1px ${buildRgba(wordRgb, Math.min(1, config.alpha + 0.15))}`,
    fontWeight: String(fontWeight)
  }
  const sentenceStyleMap = {
    background: sentenceBg,
    color: getReadableTextColor(sentenceRgb),
    padding: "0 2px",
    borderRadius: "5px",
    boxShadow: `0 0 0 1px ${buildRgba(sentenceRgb, Math.min(1, config.alpha + 0.15))}`,
    fontWeight: String(fontWeight)
  }

  return {
    mode: "highlight",
    wordColor: style.wordColor,
    sentenceColor: style.sentenceColor,
    underlineThickness: config.underlineThickness,
    fontWeight,
    wordStyleMap,
    sentenceStyleMap,
    word: mapToCssText(wordStyleMap),
    sentence: mapToCssText(sentenceStyleMap)
  }
}
