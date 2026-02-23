import { Button } from "@/components/ui/button"
import type { MapPosterTheme } from "@/lib/themes/types"
import type { TextOptions } from "@/types"
import { LocationInput } from "./LocationInput"
import { ThemeSelector } from "./ThemeSelector"
import { ThemeColorEditor } from "./ThemeColorEditor"
import { TextOverlayControls } from "./TextOverlayControls"
import { DistanceSlider } from "./DistanceSlider"

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

  onExport: () => void
  exportDisabled: boolean
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
  onExport,
  exportDisabled,
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

          <div className="flex gap-2">
            <Button
              className="flex-1 win-raised h-8 text-xs bg-secondary text-secondary-foreground active:win-sunken font-bold"
              onClick={onExport}
              disabled={exportDisabled}
            >
              Export PNG
            </Button>
          </div>

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
