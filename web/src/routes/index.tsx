import { createFileRoute } from "@tanstack/react-router"
import { useState, useCallback, useRef } from "react"
import { useQueryState, useQueryStates, parseAsString, parseAsInteger, parseAsFloat, parseAsBoolean } from "nuqs"
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
import { getAspectRatio, detectAspectRatio } from "@/types"

export const Route = createFileRoute("/")({
  component: HomePage,
})

const defaultAspectRatio = detectAspectRatio()

function HomePage() {
  // URL-synced state
  const [city, setCity] = useQueryState("city", parseAsString.withDefault(""))
  const [country, setCountry] = useQueryState("country", parseAsString.withDefault(""))
  const [distance, setDistance] = useQueryState("d", parseAsInteger.withDefault(10000))
  const [aspectRatio, setAspectRatio] = useQueryState("ratio", parseAsString.withDefault(defaultAspectRatio))
  const [lat, setLat] = useQueryState("lat", parseAsFloat)
  const [lon, setLon] = useQueryState("lon", parseAsFloat)

  const [textOptions, setTextOptions] = useQueryStates({
    showCity: parseAsBoolean.withDefault(true),
    showCountry: parseAsBoolean.withDefault(true),
    showCoordinates: parseAsBoolean.withDefault(true),
    showDivider: parseAsBoolean.withDefault(true),
  })

  // Local-only state
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const { themeName, theme, selectPreset, updateColor } = useTheme()
  const { loading: geoLoading, error: geoError, geocode } = useGeocode()
  const { stage: exportStage, doExport } = usePosterExport()

  const mapRef = useRef<maplibregl.Map | null>(null)
  const [loadingStage, setLoadingStage] = useState<LoadingStage | null>(null)

  const handleSearch = useCallback(async () => {
    setLoadingStage("geocoding")
    const result = await geocode(city, country)
    if (result) {
      setLat(result.lat)
      setLon(result.lon)
      setLoadingStage("tiles")
    } else {
      setLoadingStage(null)
    }
  }, [city, country, geocode, setLat, setLon])

  const handleExport = useCallback(
    async (size: number) => {
      const map = mapRef.current
      if (!map || lat === null || lon === null) {
        toast.error("Search for a city first")
        return
      }
      const ar = getAspectRatio(aspectRatio)
      const canvas = map.getCanvas()
      await doExport(canvas, theme, city, country, lat, lon, textOptions, size, ar.w, ar.h)
    },
    [theme, city, country, lat, lon, textOptions, doExport, aspectRatio],
  )

  const handleViewChange = useCallback(
    (newCenter: [number, number], newDistance: number) => {
      const [newLon, newLat] = newCenter
      setLat(newLat)
      setLon(newLon)
      setDistance(newDistance)
    },
    [setLat, setLon, setDistance],
  )

  const center: [number, number] | null = lat !== null && lon !== null ? [lon, lat] : null
  const ar = getAspectRatio(aspectRatio)

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
          aspectRatio={aspectRatio}
          onAspectRatioChange={setAspectRatio}
          onExport={handleExport}
          exportDisabled={exportStage !== "idle" && exportStage !== "done" && exportStage !== "error"}
          exportStage={exportStage}
        />
      </div>

      {/* Map + poster preview */}
      <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden" style={{ backgroundColor: theme.bg }}>
        <div
          className="relative h-full max-w-full"
          style={{ aspectRatio: `${ar.w} / ${ar.h}` }}
        >
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
            lat={lat}
            lon={lon}
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
    </div>
  )
}
