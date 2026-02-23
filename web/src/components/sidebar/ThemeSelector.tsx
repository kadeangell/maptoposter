import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getThemeNames } from "@/lib/themes/theme-data"
import { THEMES } from "@/lib/themes/theme-data"

interface Props {
  value: string
  onChange: (name: string) => void
}

export function ThemeSelector({ value, onChange }: Props) {
  const names = getThemeNames()

  return (
    <fieldset className="win-panel p-3">
      <legend className="px-1 font-bold text-xs">&nbsp;Theme Preset&nbsp;</legend>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="win-field h-7 text-xs">
          <SelectValue placeholder="Select theme" />
        </SelectTrigger>
        <SelectContent className="win-panel">
          {names.map((name) => (
            <SelectItem key={name} value={name} className="text-xs">
              {THEMES[name].name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </fieldset>
  )
}
