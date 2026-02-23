/**
 * Draw a gradient fade from the edge of the canvas inward, matching the
 * Python `create_gradient_fade()` behaviour.
 *
 * The gradient extends 25% of the canvas height from the chosen edge,
 * going from fully opaque at the edge to fully transparent.
 */
export function drawGradientFade(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  color: string,
  location: "top" | "bottom",
  width: number,
  height: number,
): void {
  const extent = height * 0.25;

  let gradient: CanvasGradient;

  if (location === "bottom") {
    // Opaque at the bottom edge (y = height), transparent at 25% up
    gradient = ctx.createLinearGradient(0, height, 0, height - extent);
  } else {
    // Opaque at the top edge (y = 0), transparent at 25% down
    gradient = ctx.createLinearGradient(0, 0, 0, extent);
  }

  gradient.addColorStop(0, color);
  gradient.addColorStop(1, `${color}00`);

  ctx.save();
  ctx.fillStyle = gradient;

  if (location === "bottom") {
    ctx.fillRect(0, height - extent, width, extent);
  } else {
    ctx.fillRect(0, 0, width, extent);
  }

  ctx.restore();
}
