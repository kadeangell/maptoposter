import { useState, useCallback, useMemo } from "react"
import type { MapPosterTheme } from "@/lib/themes/types"
import { THEMES, DEFAULT_THEME_KEY } from "@/lib/themes/theme-data"
import { usePersistedState } from "./usePersistedState"

export function useTheme() {
  const [themeName, setThemeName] = usePersistedState("theme-name", DEFAULT_THEME_KEY)
  const [customColors, setCustomColors] = useState<Partial<MapPosterTheme>>({})

  const baseTheme = THEMES[themeName] ?? THEMES[DEFAULT_THEME_KEY]
  const theme: MapPosterTheme = useMemo(
    () => ({ ...baseTheme, ...customColors }),
    [baseTheme, customColors],
  )

  const selectPreset = useCallback(
    (name: string) => {
      setThemeName(name)
      setCustomColors({})
    },
    [setThemeName],
  )

  const updateColor = useCallback((key: keyof MapPosterTheme, value: string) => {
    setCustomColors((prev) => ({ ...prev, [key]: value }))
  }, [])

  const resetCustom = useCallback(() => {
    setCustomColors({})
  }, [])

  return {
    themeName,
    theme,
    selectPreset,
    updateColor,
    resetCustom,
    hasCustomChanges: Object.keys(customColors).length > 0,
  }
}
