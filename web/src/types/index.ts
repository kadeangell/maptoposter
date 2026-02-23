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
}
