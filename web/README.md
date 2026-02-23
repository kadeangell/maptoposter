# Map Poster Generator -- Web App

Static client-side web app for generating map posters. No backend, no API keys, runs entirely in the browser.

Web rewrite of the [Python CLI](../README.md), itself based on [originalankur/maptoposter](https://github.com/originalankur/maptoposter).

## Quick Start

```bash
pnpm install
pnpm dev
```

## Stack

- **React 19** + TypeScript + Vite
- **MapLibre GL JS** with [OpenFreeMap](https://openfreemap.org/) vector tiles (OpenMapTiles schema)
- **Tailwind CSS v4** with a Win95-inspired aesthetic
- **TanStack Router** (file-based routing)
- **Nominatim** for geocoding (client-side fetch, cached in localStorage)

## Features

- 17 built-in theme presets with instant map restyling
- Per-color customization for background, water, parks, 6 road types, and 3 transit types
- Bidirectional map interaction -- pan/zoom updates the sidebar, sidebar controls update the map
- Live text overlay preview (city name, country, coordinates, divider line)
- Canvas-based PNG export with gradient fades and text compositing
- All settings persisted in localStorage across sessions

## Architecture

```
src/
├── routes/index.tsx            # Main page: sidebar + map + poster overlay
├── components/
│   ├── sidebar/                # Location, theme, distance, text controls
│   ├── map/MapPreview.tsx      # MapLibre GL container
│   ├── poster/PosterPreview.tsx # Live CSS text overlay
│   └── loading/                # Stage-based loading animations
├── hooks/                      # useTheme, useGeocode, usePosterExport, usePersistedState
└── lib/
    ├── themes/                 # Theme types, 17 presets, MapLibre style generator
    ├── map/                    # Geocoding, zoom/distance conversion
    └── poster/                 # Canvas export, text rendering, gradient fades
```

### Map Style Generation

`lib/themes/style-generator.ts` builds a complete MapLibre `StyleSpecification` from a theme object. The style has 14 layers (background, water, waterway, park, landcover, 6 road types, 3 transit types) with no text/symbol layers for a clean poster aesthetic.

Tile source: OpenFreeMap TileJSON at `https://tiles.openfreemap.org/planet`.

### Canvas Export Pipeline

1. Capture MapLibre canvas (`preserveDrawingBuffer: true`)
2. Draw map onto OffscreenCanvas at target resolution
3. Composite gradient fades (top/bottom, 25% extent)
4. Render text overlays (city, divider, country, coordinates) using Roboto fonts
5. Export as PNG blob and trigger download

## Scripts

```bash
pnpm dev       # Development server
pnpm build     # Production build
pnpm preview   # Preview production build
```
