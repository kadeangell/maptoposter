import type { MapPosterTheme } from "@/lib/themes/types"
import type { TextOptions } from "@/types"
import { ASPECT_RATIOS } from "@/types"
import { LocationInput } from "./LocationInput"
import { ThemeSelector } from "./ThemeSelector"
import { ThemeColorEditor } from "./ThemeColorEditor"
import { TextOverlayControls } from "./TextOverlayControls"
import { DistanceSlider } from "./DistanceSlider"
import { ExportButton } from "@/components/poster/ExportButton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Props {
  city: string
  country: string
  onCityChange: (v: string) => void
  onCountryChange: (v: string) => void
  onSearch: () => void
  searchLoading: boolean

  themeName: string
  theme: MapPosterTheme
  onSelectPreset: (name: string) => void
  onColorChange: (key: keyof MapPosterTheme, value: string) => void

  distance: number
  onDistanceChange: (v: number) => void

  textOptions: TextOptions
  onTextOptionsChange: (options: TextOptions) => void

  aspectRatio: string
  onAspectRatioChange: (v: string) => void

  onExport: (size: number) => void
  exportDisabled: boolean
  exportStage: string
}

export function Sidebar({
  city,
  country,
  onCityChange,
  onCountryChange,
  onSearch,
  searchLoading,
  themeName,
  theme,
  onSelectPreset,
  onColorChange,
  distance,
  onDistanceChange,
  textOptions,
  onTextOptionsChange,
  aspectRatio,
  onAspectRatioChange,
  onExport,
  exportDisabled,
  exportStage,
}: Props) {
  return (
    <div className="flex flex-col h-full win-panel min-w-0 overflow-hidden">
      <div className="win-titlebar flex items-center gap-2 px-2 py-1">
        <span>&#128506;</span>
        <span>Map Poster Generator</span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 min-w-0">
        <div className="flex flex-col gap-2 min-w-0">
          <LocationInput
            city={city}
            country={country}
            onCityChange={onCityChange}
            onCountryChange={onCountryChange}
            onSearch={onSearch}
            loading={searchLoading}
          />

          <ThemeSelector value={themeName} onChange={onSelectPreset} />

          <ThemeColorEditor theme={theme} onColorChange={onColorChange} />

          <DistanceSlider value={distance} onChange={onDistanceChange} />

          <TextOverlayControls
            options={textOptions}
            onChange={onTextOptionsChange}
          />

          <fieldset className="win-sunken p-2">
            <legend className="text-xs px-1">Aspect Ratio</legend>
            <Select value={aspectRatio} onValueChange={onAspectRatioChange}>
              <SelectTrigger className="win-field h-7 text-xs w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="win-panel">
                {ASPECT_RATIOS.map((r) => (
                  <SelectItem key={r.value} value={r.value} className="text-xs">
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </fieldset>

          <ExportButton
            onExport={onExport}
            disabled={exportDisabled}
            stage={exportStage}
          />

          {/* 90s web footer flair */}
          <div className="mt-2 py-2 border-t border-gray-500 text-center min-w-0">
            <div className="overflow-hidden min-w-0">
              <span className="marquee-text text-[10px] text-muted-foreground inline-block">
                *** Best viewed at 1024x768 *** Map Poster Generator v1.0 *** Free as in freedom ***
              </span>
            </div>
            <div className="mt-1 flex justify-center gap-1">
              <img
                src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="
                alt=""
                className="w-11 h-3"
              />
            </div>
            <p className="text-[9px] text-muted-foreground mt-1">
              Powered by OpenFreeMap &amp; MapLibre
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
