import File from "@src/constants/File.js";
import { Coordinates } from "@src/types.js";

const coordsTable = Array.from({ length: 8 }, (_, x) => {
  return Array.from({ length: 8 }, (_, y) => {
    return Object.create(null, {
      x: {
        value: x,
        writable: false,
        configurable: false,
        enumerable: true
      },
      y: {
        value: y,
        writable: false,
        configurable: false,
        enumerable: true
      }
    });
  });
}) as readonly Coordinates[][];

const allNotations = coordsTable.map((row, x) => {
  return row.map(({ y }) => yToFileName(y) + xToRankName(x));
});

export const Coords = {
  a8: coordsTable[0][0],
  b8: coordsTable[0][1],
  c8: coordsTable[0][2],
  d8: coordsTable[0][3],
  e8: coordsTable[0][4],
  f8: coordsTable[0][5],
  g8: coordsTable[0][6],
  h8: coordsTable[0][7],
  a7: coordsTable[1][0],
  b7: coordsTable[1][1],
  c7: coordsTable[1][2],
  d7: coordsTable[1][3],
  e7: coordsTable[1][4],
  f7: coordsTable[1][5],
  g7: coordsTable[1][6],
  h7: coordsTable[1][7],
  a6: coordsTable[2][0],
  b6: coordsTable[2][1],
  c6: coordsTable[2][2],
  d6: coordsTable[2][3],
  e6: coordsTable[2][4],
  f6: coordsTable[2][5],
  g6: coordsTable[2][6],
  h6: coordsTable[2][7],
  a5: coordsTable[3][0],
  b5: coordsTable[3][1],
  c5: coordsTable[3][2],
  d5: coordsTable[3][3],
  e5: coordsTable[3][4],
  f5: coordsTable[3][5],
  g5: coordsTable[3][6],
  h5: coordsTable[3][7],
  a4: coordsTable[4][0],
  b4: coordsTable[4][1],
  c4: coordsTable[4][2],
  d4: coordsTable[4][3],
  e4: coordsTable[4][4],
  f4: coordsTable[4][5],
  g4: coordsTable[4][6],
  h4: coordsTable[4][7],
  a3: coordsTable[5][0],
  b3: coordsTable[5][1],
  c3: coordsTable[5][2],
  d3: coordsTable[5][3],
  e3: coordsTable[5][4],
  f3: coordsTable[5][5],
  g3: coordsTable[5][6],
  h3: coordsTable[5][7],
  a2: coordsTable[6][0],
  b2: coordsTable[6][1],
  c2: coordsTable[6][2],
  d2: coordsTable[6][3],
  e2: coordsTable[6][4],
  f2: coordsTable[6][5],
  g2: coordsTable[6][6],
  h2: coordsTable[6][7],
  a1: coordsTable[7][0],
  b1: coordsTable[7][1],
  c1: coordsTable[7][2],
  d1: coordsTable[7][3],
  e1: coordsTable[7][4],
  f1: coordsTable[7][5],
  g1: coordsTable[7][6],
  h1: coordsTable[7][7]
} as const;

/**
 * `x` and `y` are expected to be within bounds of a regular board.
 */
export function getCoords(x: number, y: number): Coordinates {
  return coordsTable[x][y];
}

export function coordsToNotation({ x, y }: Coordinates): string {
  return allNotations[x][y];
}

function xToRankName(x: number): string {
  return String(8 - x);
}

export function rankNameToX(rankName: string): number {
  return 8 - +rankName;
}

function yToFileName(y: number): string {
  return File[y];
}

export function fileNameToY(fileName: string): number {
  return File[fileName as unknown as keyof typeof File];
}