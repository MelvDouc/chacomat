import { AlgebraicSquareNotation, Coords } from "@chacomat/types.js";

const notationsByIndex = {} as Record<number, AlgebraicSquareNotation>;
const indicesByNotation = {} as Record<AlgebraicSquareNotation, number>;
const coordsByIndex = {} as Record<number, Coords>;

for (let x = 0; x < 8; x++) {
  for (let y = 0; y < 8; y++) {
    const index = coordsToIndex(x, y);
    const notation = String.fromCharCode(97 + y) + String(8 - x) as AlgebraicSquareNotation;
    notationsByIndex[index] = notation;
    indicesByNotation[notation] = index;
    coordsByIndex[index] = { x, y };
  }
}

export function getRank(index: number): number {
  return Math.floor(index / 8);
}

export function getFile(index: number): number {
  return index % 8;
}

export function indexToCoords(index: number): Coords {
  return coordsByIndex[index];
}

export function indexToNotation(index: number): AlgebraicSquareNotation {
  return notationsByIndex[index];
}

export function coordsToIndex(x: number, y: number): number {
  return x * 8 + y;
}

export function coordsToNotation(x: number, y: number): AlgebraicSquareNotation {
  return notationsByIndex[coordsToIndex(x, y)];
}

export function notationToIndex(notation: AlgebraicSquareNotation): number {
  return indicesByNotation[notation];
}

export function isSafe(n: number) {
  return n >= 0 && n < 8;
}