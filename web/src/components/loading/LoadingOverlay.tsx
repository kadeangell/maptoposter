import { GeocodingAnimation } from "./GeocodingAnimation"
import { TilesAnimation } from "./TilesAnimation"
import { ExportAnimation } from "./ExportAnimation"

export type LoadingStage = "geocoding" | "tiles" | "exporting"

interface Props {
  stage: LoadingStage
}

export function LoadingOverlay({ stage }: Props) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80">
      <div className="win-panel p-6 flex flex-col items-center gap-4">
        <div className="win-titlebar w-full text-center px-2 py-1 mb-2">
          Please Wait
        </div>
        {stage === "geocoding" && <GeocodingAnimation />}
        {stage === "tiles" && <TilesAnimation />}
        {stage === "exporting" && <ExportAnimation />}
      </div>
    </div>
  )
}
