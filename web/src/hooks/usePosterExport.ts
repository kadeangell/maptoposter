import { useState, useCallback } from "react"
import type { MapPosterTheme } from "@/lib/themes/types"
import type { TextOptions } from "@/types"
import { exportPoster, downloadBlob, loadPosterFonts } from "@/lib/poster/canvas-export"

export type ExportStage = "idle" | "loading-fonts" | "compositing" | "done" | "error"

export function usePosterExport() {
  const [stage, setStage] = useState<ExportStage>("idle")
  const [error, setError] = useState<string | null>(null)

  const doExport = useCallback(
    async (
      mapCanvas: HTMLCanvasElement,
      theme: MapPosterTheme,
      city: string,
      country: string,
      lat: number,
      lon: number,
      textOptions: TextOptions,
      size: number,
      aspectW: number,
      aspectH: number,
    ) => {
      setStage("loading-fonts")
      setError(null)
      try {
        await loadPosterFonts()

        setStage("compositing")
        const width = size
        const height = Math.round(size * (aspectH / aspectW))
        const blob = await exportPoster(mapCanvas, theme, city, country, lat, lon, textOptions, width, height)

        const filename = `${city.toLowerCase().replace(/\s+/g, "_")}_poster.png`
        downloadBlob(blob, filename)

        setStage("done")
        setTimeout(() => setStage("idle"), 2000)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Export failed")
        setStage("error")
      }
    },
    [],
  )

  return { stage, error, doExport }
}
