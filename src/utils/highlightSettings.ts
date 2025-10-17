export type HighlightSettings = {
  disabledSites: Record<string, boolean>
  globalDisabledUntil?: number
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
  disabledSites: { ...(input?.disabledSites ?? {}) }
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

export const getGlobalPauseRemainingMs = (
  settings: HighlightSettings,
  now: number = Date.now()
): number => {
  const disabledUntil = settings.globalDisabledUntil ?? 0
  return Math.max(0, disabledUntil - now)
}

export const STORAGE_HIGHLIGHT_SETTINGS_KEY = STORAGE_KEY
