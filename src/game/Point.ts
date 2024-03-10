import { SquareIndex, BOARD_LENGTH } from "$src/game/constants.js";
import type { Point } from "$src/types.js";
export const pointTable: Point[][] = Array.from({ length: BOARD_LENGTH }, (_, y) => {
  return Array.from({ length: BOARD_LENGTH }, (_, x) => {
    const index = y * BOARD_LENGTH + x;
    const notation = SquareIndex[index];
    return Object.freeze({
      x,
      y,
      get index() {
        return index;
      },
      get notation() {
        return notation;
      },
      get rankNotation() {
        return notation[1];
      },
      get fileNotation() {
        return notation[0];
      },
      isLightSquare() {
        return y % 2 === x % 2;
      }
    });
  });
});

export const indexToPointTable = Array.from({ length: BOARD_LENGTH * BOARD_LENGTH }, (_, i) => {
  const y = Math.floor(i / BOARD_LENGTH);
  const x = i % BOARD_LENGTH;
  return pointTable[y][x];
});

export function invertCoordinate(coordinate: number) {
  return BOARD_LENGTH - coordinate - 1;
}

export function randomCoordinate() {
  return Math.floor(Math.random() * BOARD_LENGTH);
}

export function isSafe(coordinate: number) {
  return coordinate >= 0 && coordinate < BOARD_LENGTH;
}