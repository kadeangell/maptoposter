import type { StyleSpecification, FilterSpecification } from "maplibre-gl";
import type { MapPosterTheme } from "./types";

export function generateMapStyle(theme: MapPosterTheme): StyleSpecification {
  // "!" expression is valid MapLibre but the TS types are overly strict
  const railFilter: FilterSpecification = [
    "all",
    ["==", ["get", "class"], "rail"],
    ["!", ["in", ["get", "subclass"], ["literal", ["subway", "tram", "light_rail"]]]],
  ] as unknown as FilterSpecification;

  return {
    version: 8,
    sources: {
      openmaptiles: {
        type: "vector",
        url: "https://tiles.openfreemap.org/planet",
      },
    },
    layers: [
      {
        id: "background",
        type: "background",
        paint: {
          "background-color": theme.bg,
        },
      },
      {
        id: "water",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "water",
        paint: {
          "fill-color": theme.water,
        },
      },
      {
        id: "waterway",
        type: "line",
        source: "openmaptiles",
        "source-layer": "waterway",
        paint: {
          "line-color": theme.water,
          "line-width": 1,
        },
      },
      {
        id: "park",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "park",
        paint: {
          "fill-color": theme.parks,
        },
      },
      {
        id: "landcover-grass",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "landcover",
        filter: ["==", ["get", "class"], "grass"],
        paint: {
          "fill-color": theme.parks,
        },
      },
      {
        id: "road-default",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: [
          "in",
          ["get", "class"],
          ["literal", ["service", "track", "path"]],
        ],
        paint: {
          "line-color": theme.road_default,
          "line-width": [
            "interpolate",
            ["linear"],
            ["zoom"],
            8,
            0.2,
            14,
            0.5,
          ],
        },
      },
      {
        id: "road-residential",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["==", ["get", "class"], "minor"],
        paint: {
          "line-color": theme.road_residential,
          "line-width": [
            "interpolate",
            ["linear"],
            ["zoom"],
            8,
            0.3,
            14,
            0.8,
          ],
        },
      },
      {
        id: "road-tertiary",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["==", ["get", "class"], "tertiary"],
        paint: {
          "line-color": theme.road_tertiary,
          "line-width": [
            "interpolate",
            ["linear"],
            ["zoom"],
            8,
            0.4,
            14,
            1.2,
          ],
        },
      },
      {
        id: "road-secondary",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["==", ["get", "class"], "secondary"],
        paint: {
          "line-color": theme.road_secondary,
          "line-width": [
            "interpolate",
            ["linear"],
            ["zoom"],
            8,
            0.5,
            14,
            1.5,
          ],
        },
      },
      {
        id: "road-primary",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: [
          "any",
          ["==", ["get", "class"], "trunk"],
          ["==", ["get", "class"], "primary"],
        ],
        paint: {
          "line-color": theme.road_primary,
          "line-width": [
            "interpolate",
            ["linear"],
            ["zoom"],
            8,
            0.6,
            14,
            2.0,
          ],
        },
      },
      {
        id: "road-motorway",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["==", ["get", "class"], "motorway"],
        paint: {
          "line-color": theme.road_motorway,
          "line-width": [
            "interpolate",
            ["linear"],
            ["zoom"],
            8,
            0.8,
            14,
            2.5,
          ],
        },
      },
      {
        id: "transit-rail",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: railFilter,
        paint: {
          "line-color": theme.transit_rail,
          "line-width": 2,
          "line-opacity": 0.85,
        },
      },
      {
        id: "transit-subway",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["==", ["get", "subclass"], "subway"],
        paint: {
          "line-color": theme.transit_subway,
          "line-width": 2.5,
          "line-opacity": 0.85,
        },
      },
      {
        id: "transit-tram",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: [
          "any",
          ["==", ["get", "subclass"], "tram"],
          ["==", ["get", "subclass"], "light_rail"],
        ],
        paint: {
          "line-color": theme.transit_tram,
          "line-width": 1.5,
          "line-opacity": 0.85,
        },
      },
    ],
  };
}
