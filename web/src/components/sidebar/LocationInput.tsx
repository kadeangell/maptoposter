import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface Props {
  city: string
  country: string
  onCityChange: (v: string) => void
  onCountryChange: (v: string) => void
  onSearch: () => void
  loading: boolean
}

export function LocationInput({
  city,
  country,
  onCityChange,
  onCountryChange,
  onSearch,
  loading,
}: Props) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onSearch()
  }

  return (
    <fieldset className="win-panel p-3">
      <legend className="px-1 font-bold text-xs">&nbsp;Location&nbsp;</legend>
      <div className="flex flex-col gap-2">
        <div>
          <Label htmlFor="city" className="text-xs">City:</Label>
          <Input
            id="city"
            className="win-field h-7 text-xs"
            placeholder="Paris"
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div>
          <Label htmlFor="country" className="text-xs">Country:</Label>
          <Input
            id="country"
            className="win-field h-7 text-xs"
            placeholder="France"
            value={country}
            onChange={(e) => onCountryChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <Button
          className="win-raised h-7 text-xs bg-secondary text-secondary-foreground active:win-sunken"
          onClick={onSearch}
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>
    </fieldset>
  )
}
