import type { TextOptions } from "@/lib/poster/text-renderer";
import { drawGradientFade } from "@/lib/poster/gradient-renderer";
import { drawTextOverlays } from "@/lib/poster/text-renderer";

/**
 * Compose the final poster image and return it as a PNG Blob.
 *
 * Pipeline:
 * 1. Fill with background colour
 * 2. Draw the map canvas (stretched to fill)
 * 3. Apply gradient fades (top & bottom)
 * 4. Render text overlays
 */
export async function exportPoster(
  mapCanvas: HTMLCanvasElement,
  theme: { bg: string; text: string; gradient_color: string },
  city: string,
  country: string,
  lat: number,
  lon: number,
  textOptions: TextOptions,
  width: number,
  height: number,
): Promise<Blob> {
  const offscreen = new OffscreenCanvas(width, height);
  const ctx = offscreen.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to create OffscreenCanvas 2D context");
  }

  // 1. Background fill
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, width, height);

  // 2. Map image (stretch to fill)
  ctx.drawImage(mapCanvas, 0, 0, width, height);

  // 3. Gradient fades
  drawGradientFade(ctx, theme.gradient_color, "top", width, height);
  drawGradientFade(ctx, theme.gradient_color, "bottom", width, height);

  // 4. Text overlays
  drawTextOverlays(ctx, theme.text, city, country, lat, lon, textOptions, width, height);

  // 5. Export
  return offscreen.convertToBlob({ type: "image/png" });
}

/**
 * Trigger a file download from a Blob.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Pre-load the Roboto font faces required by the poster text renderer.
 * Expects font files to be served from /fonts/.
 */
export async function loadPosterFonts(): Promise<void> {
  const faces = [
    new FontFace("Roboto", "url(/fonts/Roboto-Bold.ttf)", {
      weight: "700",
      style: "normal",
    }),
    new FontFace("Roboto", "url(/fonts/Roboto-Regular.ttf)", {
      weight: "400",
      style: "normal",
    }),
    new FontFace("Roboto", "url(/fonts/Roboto-Light.ttf)", {
      weight: "300",
      style: "normal",
    }),
  ];

  const loaded = await Promise.all(faces.map((f) => f.load()));
  for (const face of loaded) {
    document.fonts.add(face);
  }
}
