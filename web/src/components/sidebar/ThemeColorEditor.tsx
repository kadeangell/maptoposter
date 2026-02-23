import type { MapPosterTheme } from "@/lib/themes/types"

type ColorKey = keyof Omit<MapPosterTheme, "name" | "description">

interface ColorRow {
  key: ColorKey
  label: string
}

const GROUPS: { title: string; rows: ColorRow[] }[] = [
  {
    title: "General",
    rows: [
      { key: "bg", label: "Background" },
      { key: "text", label: "Text" },
      { key: "gradient_color", label: "Gradient" },
      { key: "water", label: "Water" },
      { key: "parks", label: "Parks" },
    ],
  },
  {
    title: "Roads",
    rows: [
      { key: "road_motorway", label: "Motorway" },
      { key: "road_primary", label: "Primary" },
      { key: "road_secondary", label: "Secondary" },
      { key: "road_tertiary", label: "Tertiary" },
      { key: "road_residential", label: "Residential" },
      { key: "road_default", label: "Default" },
    ],
  },
  {
    title: "Transit",
    rows: [
      { key: "transit", label: "Transit" },
      { key: "transit_rail", label: "Rail" },
      { key: "transit_subway", label: "Subway" },
      { key: "transit_tram", label: "Tram" },
    ],
  },
]

interface Props {
  theme: MapPosterTheme
  onColorChange: (key: keyof MapPosterTheme, value: string) => void
}

export function ThemeColorEditor({ theme, onColorChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {GROUPS.map((group) => (
        <fieldset key={group.title} className="win-panel p-2">
          <legend className="px-1 font-bold text-xs">&nbsp;{group.title}&nbsp;</legend>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            {group.rows.map(({ key, label }) => (
              <label key={key} className="flex items-center gap-1.5 text-xs">
                <input
                  type="color"
                  className="w-6 h-5 p-0 border border-gray-500 cursor-pointer"
                  value={theme[key]}
                  onChange={(e) => onColorChange(key, e.target.value)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  )
}
