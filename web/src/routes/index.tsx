import { createFileRoute } from "@tanstack/react-router"
import { useState, useCallback, useRef } from "react"
import maplibregl from "maplibre-gl"
import { toast } from "sonner"
import { Sidebar } from "@/components/sidebar/Sidebar"
import { MapPreview } from "@/components/map/MapPreview"
import { PosterPreview } from "@/components/poster/PosterPreview"
import { LoadingOverlay } from "@/components/loading/LoadingOverlay"
import type { LoadingStage } from "@/components/loading/LoadingOverlay"
import { useGeocode } from "@/hooks/useGeocode"
import { useTheme } from "@/hooks/useTheme"
import { usePosterExport } from "@/hooks/usePosterExport"
import { usePersistedState } from "@/hooks/usePersistedState"
import type { TextOptions } from "@/types"

export const Route = createFileRoute("/")({
  component: HomePage,
})

function HomePage() {
  const [city, setCity] = usePersistedState("city", "")
  const [country, setCountry] = usePersistedState("country", "")
  const [distance, setDistance] = usePersistedState("distance", 10000)
  const [textOptions, setTextOptions] = usePersistedState<TextOptions>("text-options", {
    showCity: true,
    showCountry: true,
    showCoordinates: true,
    showDivider: true,
  })
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const { themeName, theme, selectPreset, updateColor } = useTheme()
  const { result: geoResult, setResult: setGeoResult, loading: geoLoading, error: geoError, geocode } = useGeocode()
  const { stage: exportStage, doExport } = usePosterExport()

  const mapRef = useRef<maplibregl.Map | null>(null)
  const [loadingStage, setLoadingStage] = useState<LoadingStage | null>(null)

  const handleSearch = useCallback(async () => {
    setLoadingStage("geocoding")
    const result = await geocode(city, country)
    if (result) {
      setLoadingStage("tiles")
      // Tiles loading overlay will be dismissed by onTilesLoaded
    } else {
      setLoadingStage(null)
    }
  }, [city, country, geocode])

  const handleExport = useCallback(
    async (size: number) => {
      const map = mapRef.current
      if (!map || !geoResult) {
        toast.error("Search for a city first")
        return
      }
      const canvas = map.getCanvas()
      await doExport(canvas, theme, city, country, geoResult.lat, geoResult.lon, textOptions, size)
    },
    [theme, city, country, geoResult, textOptions, doExport],
  )

  const handleViewChange = useCallback(
    (newCenter: [number, number], newDistance: number) => {
      const [lon, lat] = newCenter
      setGeoResult({ lat, lon, displayName: geoResult?.displayName ?? "" })
      setDistance(newDistance)
    },
    [geoResult?.displayName, setGeoResult, setDistance],
  )

  const center: [number, number] | null = geoResult ? [geoResult.lon, geoResult.lat] : null

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Mobile toggle */}
      <button
        className="md:hidden win-raised p-1 m-1 text-xs self-start z-20"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? "Hide Panel" : "Show Panel"}
      </button>

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "block" : "hidden"
        } md:block w-full md:w-[340px] lg:w-[360px] shrink-0 h-full overflow-hidden z-10`}
      >
        <Sidebar
          city={city}
          country={country}
          onCityChange={setCity}
          onCountryChange={setCountry}
          onSearch={handleSearch}
          searchLoading={geoLoading}
          themeName={themeName}
          theme={theme}
          onSelectPreset={selectPreset}
          onColorChange={updateColor}
          distance={distance}
          onDistanceChange={setDistance}
          textOptions={textOptions}
          onTextOptionsChange={setTextOptions}
          onExport={() => handleExport(1600)}
          exportDisabled={exportStage !== "idle" && exportStage !== "done" && exportStage !== "error"}
        />
      </div>

      {/* Map + poster preview */}
      <div className="flex-1 relative min-h-0">
        <MapPreview
          theme={theme}
          center={center}
          distance={distance}
          onMapReady={(map) => {
            mapRef.current = map
          }}
          onTilesLoaded={() => {
            if (loadingStage === "tiles") setLoadingStage(null)
          }}
          onViewChange={handleViewChange}
        />

        <PosterPreview
          city={city}
          country={country}
          lat={geoResult?.lat ?? null}
          lon={geoResult?.lon ?? null}
          textColor={theme.text}
          gradientColor={theme.gradient_color}
          options={textOptions}
        />

        {loadingStage && <LoadingOverlay stage={loadingStage} />}

        {geoError && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 win-panel px-3 py-1 text-xs text-red-800 bg-yellow-100 border border-red-400">
            {geoError}
          </div>
        )}

        {/* 90s visitor counter badge */}
        <div className="absolute bottom-1 right-1 z-10 text-[9px] text-muted-foreground bg-background/70 px-1">
          OpenFreeMap | OpenMapTiles | OSM contributors
        </div>
      </div>
    </div>
  )
}
