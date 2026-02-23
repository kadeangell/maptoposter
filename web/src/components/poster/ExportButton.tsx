import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"

interface Props {
  onExport: (size: number) => void
  disabled: boolean
  stage: string
}

const SIZES = [
  { label: "Preview (1600px)", value: "1600" },
  { label: "Print (4800px)", value: "4800" },
  { label: "Small (800px)", value: "800" },
]

export function ExportButton({ onExport, disabled, stage }: Props) {
  const [size, setSize] = useState("1600")

  const label =
    stage === "loading-fonts"
      ? "Loading fonts..."
      : stage === "compositing"
        ? "Rendering..."
        : stage === "done"
          ? "Done!"
          : "Export PNG"

  return (
    <div className="flex gap-1">
      <Select value={size} onValueChange={setSize}>
        <SelectTrigger className="win-field h-7 text-xs w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="win-panel">
          {SIZES.map((s) => (
            <SelectItem key={s.value} value={s.value} className="text-xs">
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        className="flex-1 win-raised h-7 text-xs bg-secondary text-secondary-foreground active:win-sunken font-bold"
        onClick={() => onExport(parseInt(size))}
        disabled={disabled}
      >
        {label}
      </Button>
    </div>
  )
}
