import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { TextOptions } from "@/types"

interface Props {
  options: TextOptions
  onChange: (options: TextOptions) => void
}

const TOGGLES: { key: keyof TextOptions; label: string }[] = [
  { key: "showCity", label: "City Name" },
  { key: "showCountry", label: "Country" },
  { key: "showCoordinates", label: "Coordinates" },
  { key: "showDivider", label: "Divider Line" },
]

export function TextOverlayControls({ options, onChange }: Props) {
  return (
    <fieldset className="win-panel p-3">
      <legend className="px-1 font-bold text-xs">&nbsp;Text Overlays&nbsp;</legend>
      <div className="flex flex-col gap-2">
        {TOGGLES.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-2">
            <Switch
              id={key}
              checked={options[key]}
              onCheckedChange={(checked) =>
                onChange({ ...options, [key]: checked })
              }
            />
            <Label htmlFor={key} className="text-xs cursor-pointer">
              {label}
            </Label>
          </div>
        ))}
      </div>
    </fieldset>
  )
}
