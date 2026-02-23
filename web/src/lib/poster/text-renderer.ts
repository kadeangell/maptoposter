import { formatCoordinates } from "@/lib/map/map-utils";

export interface TextOptions {
  showCity: boolean;
  showCountry: boolean;
  showCoordinates: boolean;
  showDivider: boolean;
}

/**
 * Draw poster text overlays onto a canvas, matching the Python render.py
 * positions:
 *
 *   - City name:    y = height * (1 - 0.14)   bold, large, spaced uppercase
 *   - Divider:      y = height * (1 - 0.125)  line from 40% to 60% width
 *   - Country:      y = height * (1 - 0.10)   light weight, uppercase
 *   - Coordinates:  y = height * (1 - 0.07)   alpha 0.7, regular weight
 *
 * All text is horizontally centered with the Roboto font family.
 */
export function drawTextOverlays(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  textColor: string,
  city: string,
  country: string,
  lat: number,
  lon: number,
  options: TextOptions,
  width: number,
  height: number,
): void {
  const centerX = width / 2;

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // --- City name ---
  if (options.showCity) {
    const cityFontSize = Math.round(height * 0.04);
    ctx.font = `bold ${cityFontSize}px "Roboto", sans-serif`;
    ctx.fillStyle = textColor;

    const spacedCity = city.toUpperCase().split("").join("  ");
    const cityY = height * (1 - 0.14);
    ctx.fillText(spacedCity, centerX, cityY);
  }

  // --- Divider line ---
  if (options.showDivider) {
    const dividerY = height * (1 - 0.125);
    ctx.beginPath();
    ctx.moveTo(width * 0.4, dividerY);
    ctx.lineTo(width * 0.6, dividerY);
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // --- Country ---
  if (options.showCountry) {
    const countryFontSize = Math.round(height * 0.015);
    ctx.font = `300 ${countryFontSize}px "Roboto", sans-serif`;
    ctx.fillStyle = textColor;

    const countryY = height * (1 - 0.10);
    ctx.fillText(country.toUpperCase(), centerX, countryY);
  }

  // --- Coordinates ---
  if (options.showCoordinates) {
    const coordsFontSize = Math.round(height * 0.01);
    ctx.font = `400 ${coordsFontSize}px "Roboto", sans-serif`;
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = textColor;

    const coordsY = height * (1 - 0.07);
    ctx.fillText(formatCoordinates(lat, lon), centerX, coordsY);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}
