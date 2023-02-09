import { AlgebraicSquareNotation, Coords } from "@chacomat/types.local.js";

function xToRankName(x: number) {
  return String(8 - x);
}

function yToFileName(x: number) {
  return String.fromCharCode(97 + x);
}

export function rankNameToX(rankName: string) {
  return 8 - +rankName;
}

function fileNameToY(fileName: string) {
  return fileName.charCodeAt(0) - 97;
}

export function coordsToNotation(coords: Coords): AlgebraicSquareNotation {
  return yToFileName(coords.y) + xToRankName(coords.x) as AlgebraicSquareNotation;
}

export function notationToCoords(notation: AlgebraicSquareNotation): Coords {
  return {
    x: rankNameToX(notation[1]),
    y: fileNameToY(notation[0])
  };
}

export function isSafe(n: number): boolean {
  return n >= 0 && n < 8;
}