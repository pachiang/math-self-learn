/** Compute the (x, y) position of vertex at index `i` in a regular n-gon. */
export function vertexPosition(
  i: number,
  n: number,
  radius: number,
): { x: number; y: number } {
  const angle = (i * 2 * Math.PI) / n;
  return {
    x: Math.round(radius * Math.sin(angle) * 100) / 100,
    y: Math.round(-radius * Math.cos(angle) * 100) / 100,
  };
}

/** SVG polygon points string for a regular n-gon. */
export function polygonPoints(n: number, radius: number): string {
  return Array.from({ length: n }, (_, i) => {
    const { x, y } = vertexPosition(i, n, radius);
    return `${x},${y}`;
  }).join(' ');
}
