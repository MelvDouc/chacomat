import type { AlgebraicSquareNotation, Coords } from "../types.js";

const notations: Record<number, Record<number, AlgebraicSquareNotation>> = {};
const coordsByNotations: Map<AlgebraicSquareNotation, Coords> = new Map();

for (let x = 0; x < 8; x++) {
  notations[x] = {};
  for (let y = 0; y < 8; y++) {
    const notation = String.fromCharCode(97 + y) +
      String(8 - x) as AlgebraicSquareNotation;
    notations[x][y] = notation;
    coordsByNotations.set(notation, { x, y });
  }
}

export function coordsToNotation(
  { x, y }: Coords,
): AlgebraicSquareNotation | null {
  if (x in notations && y in notations[x]) {
    return notations[x][y];
  }
  return null;
}

export function notationToCoords(
  notation: AlgebraicSquareNotation,
): Coords | null {
  return coordsByNotations.get(notation) ?? null;
}
