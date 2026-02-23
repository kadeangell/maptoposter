import { useEffect, useRef, useCallback } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import type { MapPosterTheme } from "@/lib/themes/types"
import { generateMapStyle } from "@/lib/themes/style-generator"
import { distanceToZoom, zoomToDistance } from "@/lib/map/map-utils"

interface Props {
  theme: MapPosterTheme
  center: [number, number] | null // [lon, lat]
  distance: number
  onMapReady?: (map: maplibregl.Map) => void
  onTilesLoaded?: () => void
  onViewChange?: (center: [number, number], distance: number) => void
}

export function MapPreview({ theme, center, distance, onMapReady, onTilesLoaded, onViewChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)

  // Keep callback refs current so event handlers always call the latest version
  const onMapReadyRef = useRef(onMapReady)
  onMapReadyRef.current = onMapReady
  const onTilesLoadedRef = useRef(onTilesLoaded)
  onTilesLoadedRef.current = onTilesLoaded
  const onViewChangeRef = useRef(onViewChange)
  onViewChangeRef.current = onViewChange

  // Flag to skip view-change callbacks from programmatic moves (flyTo)
  const isProgrammaticMove = useRef(false)

  // Initialize map
  useEffect(() => {
    if (!containerRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: generateMapStyle(theme),
      center: center ?? [2.3522, 48.8566], // Default: Paris
      zoom: center ? distanceToZoom(distance, center[1]) : 12,
      canvasContextAttributes: { preserveDrawingBuffer: true },
      attributionControl: false,
    })

    map.on("load", () => {
      onMapReadyRef.current?.(map)
    })

    map.on("idle", () => {
      onTilesLoadedRef.current?.()
    })

    map.on("moveend", () => {
      if (isProgrammaticMove.current) {
        isProgrammaticMove.current = false
        return
      }
      const c = map.getCenter()
      const z = map.getZoom()
      const dist = zoomToDistance(z, c.lat)
      onViewChangeRef.current?.([c.lng, c.lat], Math.round(dist))
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update style when theme changes (skip initial mount — map was created with current style)
  const isFirstStyle = useRef(true)
  useEffect(() => {
    if (isFirstStyle.current) {
      isFirstStyle.current = false
      return
    }
    const map = mapRef.current
    if (!map) return
    map.setStyle(generateMapStyle(theme))
  }, [theme])

  // Fly to location when center/distance changes (skip if map already matches)
  useEffect(() => {
    const map = mapRef.current
    if (!map || !center) return
    const targetZoom = distanceToZoom(distance, center[1])
    const cur = map.getCenter()
    const curZoom = map.getZoom()
    // Skip if map is already at this position (prevents feedback loop from onViewChange)
    if (
      Math.abs(cur.lng - center[0]) < 0.0001 &&
      Math.abs(cur.lat - center[1]) < 0.0001 &&
      Math.abs(curZoom - targetZoom) < 0.1
    ) {
      return
    }
    isProgrammaticMove.current = true
    map.flyTo({
      center,
      zoom: targetZoom,
      duration: 1500,
    })
  }, [center, distance])

  const getCanvas = useCallback(() => {
    return mapRef.current?.getCanvas() ?? null
  }, [])

  // Expose getCanvas on the component via a ref-like pattern
  const canvasGetterRef = useRef(getCanvas)
  canvasGetterRef.current = getCanvas

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      data-get-canvas=""
    />
  )
}

// Helper to get the map canvas from the parent via ref
MapPreview.getCanvasFromMap = (map: maplibregl.Map) => map.getCanvas()
