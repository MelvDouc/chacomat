import type { PieceOffsets } from "@chacomat/types.local.js";

export const rookOffsets: PieceOffsets = {
  x: [0, -1, 0, 1],
  y: [-1, 0, 1, 0]
};

export const bishopOffsets: PieceOffsets = {
  x: [-1, -1, 1, 1],
  y: [-1, 1, -1, 1]
};

export const adjacentOffsets: PieceOffsets = {
  x: rookOffsets.x.concat(bishopOffsets.x),
  y: rookOffsets.y.concat(bishopOffsets.y)
};