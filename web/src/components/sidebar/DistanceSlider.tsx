import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

interface Props {
  value: number
  onChange: (v: number) => void
}

export function DistanceSlider({ value, onChange }: Props) {
  return (
    <fieldset className="win-panel p-3">
      <legend className="px-1 font-bold text-xs">&nbsp;Map Radius&nbsp;</legend>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs">
          <Label>Distance:</Label>
          <span className="font-mono">{(value / 1000).toFixed(0)} km</span>
        </div>
        <Slider
          min={1000}
          max={50000}
          step={500}
          value={[value]}
          onValueChange={([v]) => onChange(v)}
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>1 km</span>
          <span>50 km</span>
        </div>
      </div>
    </fieldset>
  )
}
