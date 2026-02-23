/**
 * Convert a distance in meters to a MapLibre zoom level.
 *
 * Uses the Web Mercator approximation:
 *   zoom = log2(earthCircumference * cos(lat) / (distance * 2)) - 1
 *
 * Result is clamped to [1, 20].
 */
export function distanceToZoom(distMeters: number, lat: number): number {
  const EARTH_CIRCUMFERENCE = 40_075_016.686;
  const latRad = (lat * Math.PI) / 180;
  const raw = Math.log2(
    (EARTH_CIRCUMFERENCE * Math.cos(latRad)) / (distMeters * 2),
  ) - 1;
  return Math.min(20, Math.max(1, raw));
}

/**
 * Convert a MapLibre zoom level back to a distance in meters.
 * Inverse of distanceToZoom.
 */
export function zoomToDistance(zoom: number, lat: number): number {
  const EARTH_CIRCUMFERENCE = 40_075_016.686;
  const latRad = (lat * Math.PI) / 180;
  return (EARTH_CIRCUMFERENCE * Math.cos(latRad)) / (2 * Math.pow(2, zoom + 1));
}

/**
 * Format latitude/longitude matching the Python poster app style.
 *
 * Examples:
 *   formatCoordinates(48.8566, 2.3522)   => "48.8566\u00b0 N / 2.3522\u00b0 E"
 *   formatCoordinates(-33.8688, 151.2093) => "33.8688\u00b0 S / 151.2093\u00b0 E"
 *   formatCoordinates(40.7128, -74.0060)  => "40.7128\u00b0 N / 74.0060\u00b0 W"
 */
export function formatCoordinates(lat: number, lon: number): string {
  const latDir = lat >= 0 ? "N" : "S";
  const lonDir = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}\u00b0 ${latDir} / ${Math.abs(lon).toFixed(4)}\u00b0 ${lonDir}`;
}
