import { AlgebraicSquareNotation } from "@chacomat/types.js";

export function getRank(index: number): number {
  return Math.floor(index / 8);
}

export function getFile(index: number): number {
  return index % 8;
}

export function indexToCoords(index: number): { x: number; y: number; } {
  return {
    x: getRank(index),
    y: getFile(index)
  };
}

export function indexToNotation(index: number): AlgebraicSquareNotation {
  const { x, y } = indexToCoords(index);
  return String.fromCharCode(97 + y) + String(8 - x) as AlgebraicSquareNotation;
}

export function coordsToIndex(x: number, y: number): number {
  return x * 8 + y;
}

export function coordsToNotation(x: number, y: number): AlgebraicSquareNotation {
  return indexToNotation(coordsToIndex(x, y));
}

export function notationToIndex(notation: AlgebraicSquareNotation): number {
  return coordsToIndex(8 - +notation[1], notation[0].charCodeAt(0) - 97);
}

export function isSafe(n: number) {
  return n >= 0 && n < 8;
}