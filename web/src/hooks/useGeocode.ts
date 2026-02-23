import { useState, useCallback } from "react"
import type { GeocodingResult } from "@/types"

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org"
const CACHE_PREFIX = "mtp:geocode:"
const CACHE_TTL = 30 * 24 * 60 * 60 * 1000 // 30 days

export function useGeocode() {
  const [result, setResult] = useState<GeocodingResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const geocode = useCallback(async (city: string, country: string) => {
    if (!city.trim() || !country.trim()) {
      setError("Enter both city and country")
      return null
    }

    const cacheKey = CACHE_PREFIX + `${city.toLowerCase()}-${country.toLowerCase()}`
    try {
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed.expiry && Date.now() < parsed.expiry) {
          setResult(parsed.value)
          setError(null)
          return parsed.value as GeocodingResult
        }
      }
    } catch {
      // ignore cache errors
    }

    setLoading(true)
    setError(null)

    try {
      const query = `${city}, ${country}`
      const params = new URLSearchParams({ q: query, format: "json", limit: "1" })
      const res = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
        headers: { "User-Agent": "MapPosterWeb/1.0" },
      })

      if (!res.ok) throw new Error("Geocoding request failed")

      const data = await res.json()
      if (!data.length) throw new Error(`Could not find "${city}, ${country}"`)

      const geo: GeocodingResult = {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        displayName: data[0].display_name,
      }

      localStorage.setItem(cacheKey, JSON.stringify({ value: geo, expiry: Date.now() + CACHE_TTL }))

      setResult(geo)
      return geo
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Geocoding failed"
      setError(msg)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { result, setResult, loading, error, geocode }
}
