export interface GeocodingResult {
  lat: number
  lon: number
  displayName: string
}

export interface TextOptions {
  showCity: boolean
  showCountry: boolean
  showCoordinates: boolean
  showDivider: boolean
}

export interface AppSettings {
  city: string
  country: string
  themeName: string
  distance: number
  textOptions: TextOptions
  aspectRatio: string
}

export const ASPECT_RATIOS = [
  { label: "9:16 Tall", value: "9:16", w: 9, h: 16 },
  { label: "2:3 Portrait", value: "2:3", w: 2, h: 3 },
  { label: "3:4 Portrait", value: "3:4", w: 3, h: 4 },
  { label: "4:5 Portrait", value: "4:5", w: 4, h: 5 },
  { label: "1:1 Square", value: "1:1", w: 1, h: 1 },
  { label: "5:4 Landscape", value: "5:4", w: 5, h: 4 },
  { label: "4:3 Landscape", value: "4:3", w: 4, h: 3 },
  { label: "3:2 Landscape", value: "3:2", w: 3, h: 2 },
  { label: "16:9 Wide", value: "16:9", w: 16, h: 9 },
] as const

export function getAspectRatio(value: string) {
  return ASPECT_RATIOS.find((r) => r.value === value) ?? ASPECT_RATIOS[0]
}

export function detectAspectRatio(): string {
  const screenRatio = window.screen.width / window.screen.height
  let closestValue = "1:1"
  let minDiff = Infinity
  for (const r of ASPECT_RATIOS) {
    const diff = Math.abs(r.w / r.h - screenRatio)
    if (diff < minDiff) {
      minDiff = diff
      closestValue = r.value
    }
  }
  return closestValue
}
