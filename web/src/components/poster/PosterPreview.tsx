import type { TextOptions } from "@/types"
import { formatCoordinates } from "@/lib/map/map-utils"

interface Props {
  city: string
  country: string
  lat: number | null
  lon: number | null
  textColor: string
  gradientColor: string
  options: TextOptions
}

export function PosterPreview({
  city,
  country,
  lat,
  lon,
  textColor,
  gradientColor,
  options,
}: Props) {
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Top gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-1/4"
        style={{
          background: `linear-gradient(to bottom, ${gradientColor}, transparent)`,
        }}
      />

      {/* Bottom gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/4"
        style={{
          background: `linear-gradient(to top, ${gradientColor}, transparent)`,
        }}
      />

      {/* Text overlays */}
      <div className="absolute inset-0 flex flex-col items-center" style={{ color: textColor }}>
        {options.showCity && city && (
          <p
            className="font-bold tracking-[0.5em] uppercase"
            style={{
              fontFamily: "Roboto, sans-serif",
              fontSize: "clamp(16px, 4vw, 40px)",
              position: "absolute",
              bottom: "14%",
            }}
          >
            {city}
          </p>
        )}

        {options.showDivider && (
          <div
            className="absolute"
            style={{
              bottom: "12.5%",
              left: "40%",
              right: "40%",
              height: "1px",
              background: textColor,
            }}
          />
        )}

        {options.showCountry && country && (
          <p
            className="uppercase tracking-widest"
            style={{
              fontFamily: "Roboto, sans-serif",
              fontWeight: 300,
              fontSize: "clamp(10px, 1.8vw, 18px)",
              position: "absolute",
              bottom: "10%",
            }}
          >
            {country}
          </p>
        )}

        {options.showCoordinates && lat !== null && lon !== null && (
          <p
            className="opacity-70"
            style={{
              fontFamily: "Roboto, sans-serif",
              fontSize: "clamp(8px, 1.2vw, 12px)",
              position: "absolute",
              bottom: "7%",
            }}
          >
            {formatCoordinates(lat, lon)}
          </p>
        )}
      </div>
    </div>
  )
}
