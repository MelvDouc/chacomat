import { Coords } from "@/types.ts";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];

export function isSafe(x: number, y: number, boardHeight: number, boardWidth: number) {
  return x >= 0 && x < boardHeight && y >= 0 && y < boardWidth;
}

export function coordsToIndex({ x, y }: Coords, boardWidth: number) {
  return x * boardWidth + y;
}

export function indexToCoords(index: number, boardWidth: number): Coords {
  return {
    x: Math.floor(index / boardWidth),
    y: index % boardWidth
  };
}

export function indexToNotation(index: number, boardWidth: number) {
  return yToFileName(index % boardWidth) + xToRankName(Math.floor(index / boardWidth), boardWidth);
}

export function notationToIndex(notation: string, boardWidth: number) {
  return coordsToIndex({
    x: rankNameToX(notation.slice(1), boardWidth),
    y: fileNameToY(notation[0])
  }, boardWidth);
}

export function rankNameToX(rank: string, boardHeight: number) {
  return boardHeight - +rank;
}

export function fileNameToY(fileName: string) {
  return FILES.indexOf(fileName);
}

export function xToRankName(x: number, boardHeight: number) {
  return String(boardHeight - x);
}

export function yToFileName(y: number) {
  return FILES[y];
}