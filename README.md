# Map Poster Generator

Generate minimalist map posters for any city in the world. Available as a **web app** (browser-based, no install) or a **Python CLI** for batch generation.

Based on [originalankur/maptoposter](https://github.com/originalankur/maptoposter).

<img src="posters/singapore_neon_cyberpunk_20260108_184503.png" width="250"> <img src="posters/dubai_midnight_blue_20260108_174920.png" width="250"> <img src="posters/venice_blueprint_20260108_165527.png" width="250">

## Web App

A static client-side app -- no backend, no API keys, runs entirely in the browser.

```bash
cd web
pnpm install
pnpm dev
```

**Stack:** React, Vite, TypeScript, MapLibre GL JS, OpenFreeMap, Tailwind CSS v4

**Features:**
- 17 built-in themes with live preview
- Per-color customization for every map element
- Interactive map -- pan, zoom, and the sidebar syncs
- Text overlays (city, country, coordinates, divider)
- Canvas-based PNG export
- Settings persisted in localStorage

See [`web/README.md`](web/README.md) for details.

## CLI

The Python CLI uses OSMnx to download OpenStreetMap data and renders posters with matplotlib.

### Install

```bash
pip install -r requirements.txt
```

### Usage

```bash
python create_map_poster.py --city <city> --country <country> [options]
```

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--city` | `-c` | City name | required |
| `--country` | `-C` | Country name | required |
| `--theme` | `-t` | Theme name | feature_based |
| `--distance` | `-d` | Map radius in meters | 29000 |
| `--list-themes` | | List all available themes | |

### Examples

```bash
python create_map_poster.py -c "New York" -C "USA" -t noir -d 12000
python create_map_poster.py -c "Venice" -C "Italy" -t blueprint -d 4000
python create_map_poster.py -c "Tokyo" -C "Japan" -t japanese_ink -d 15000
python create_map_poster.py -c "Paris" -C "France" -t pastel_dream -d 10000
python create_map_poster.py --list-themes
```

### Distance Guide

| Distance | Best for |
|----------|----------|
| 4000-6000m | Small/dense cities (Venice, Amsterdam center) |
| 8000-12000m | Medium cities (Paris, Barcelona) |
| 15000-20000m | Large metros (Tokyo, Mumbai) |

## Gallery

| City | Theme | Poster |
|:----:|:-----:|:------:|
| San Francisco | sunset | <img src="posters/san_francisco_sunset_20260108_184122.png" width="200"> |
| Barcelona | warm_beige | <img src="posters/barcelona_warm_beige_20260108_172924.png" width="200"> |
| Venice | blueprint | <img src="posters/venice_blueprint_20260108_165527.png" width="200"> |
| Tokyo | japanese_ink | <img src="posters/tokyo_japanese_ink_20260108_165830.png" width="200"> |
| Mumbai | contrast_zones | <img src="posters/mumbai_contrast_zones_20260108_170325.png" width="200"> |
| Marrakech | terracotta | <img src="posters/marrakech_terracotta_20260108_180821.png" width="200"> |
| Singapore | neon_cyberpunk | <img src="posters/singapore_neon_cyberpunk_20260108_184503.png" width="200"> |
| Melbourne | forest | <img src="posters/melbourne_forest_20260108_181459.png" width="200"> |
| Dubai | midnight_blue | <img src="posters/dubai_midnight_blue_20260108_174920.png" width="200"> |

## Themes

17 themes in `themes/`:

| Theme | Style |
|-------|-------|
| `feature_based` | Classic black & white with road hierarchy |
| `gradient_roads` | Smooth gradient shading |
| `contrast_zones` | High contrast urban density |
| `noir` | Pure black background, white roads |
| `midnight_blue` | Navy background with gold roads |
| `blueprint` | Architectural blueprint aesthetic |
| `neon_cyberpunk` | Dark with electric pink/cyan |
| `warm_beige` | Vintage sepia tones |
| `pastel_dream` | Soft muted pastels |
| `japanese_ink` | Minimalist ink wash style |
| `forest` | Deep greens and sage |
| `ocean` | Blues and teals |
| `terracotta` | Mediterranean warmth |
| `sunset` | Warm oranges and pinks |
| `autumn` | Burnt oranges and reds |
| `copper_patina` | Oxidized copper aesthetic |
| `monochrome_blue` | Single blue color family |

### Custom Themes

Create a JSON file in `themes/`:

```json
{
  "name": "My Theme",
  "description": "Description of the theme",
  "bg": "#FFFFFF",
  "text": "#000000",
  "gradient_color": "#FFFFFF",
  "water": "#C0C0C0",
  "parks": "#F0F0F0",
  "road_motorway": "#0A0A0A",
  "road_primary": "#1A1A1A",
  "road_secondary": "#2A2A2A",
  "road_tertiary": "#3A3A3A",
  "road_residential": "#4A4A4A",
  "road_default": "#3A3A3A"
}
```

## Project Structure

```
maptoposter/
├── web/                     # Browser-based app (React + MapLibre)
├── create_map_poster.py     # CLI entry point
├── render.py                # Matplotlib rendering pipeline
├── data.py                  # OSMnx data fetching
├── cache.py                 # Smart caching (reuses larger-radius data)
├── config.py                # Constants
├── themes.py                # Theme loading
├── app.py                   # PyQt6 desktop app
├── themes/                  # Theme JSON files
├── fonts/                   # Roboto font files
└── posters/                 # Generated output
```

## Credits

- Original project: [originalankur/maptoposter](https://github.com/originalankur/maptoposter)
- Map data: [OpenStreetMap](https://www.openstreetmap.org/) contributors
- Vector tiles: [OpenFreeMap](https://openfreemap.org/) + [OpenMapTiles](https://openmaptiles.org/)
- Geocoding: [Nominatim](https://nominatim.openstreetmap.org/)
