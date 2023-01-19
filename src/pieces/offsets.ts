import type { NonPawnPieceType, PieceOffsets } from "@chacomat/types.js";
import Color from "@chacomat/utils/Color.js";
import { PieceType } from "@chacomat/utils/constants.js";

export const pawnOffsets = {
  x: {
    [Color.WHITE]: [-1, -1],
    [Color.BLACK]: [1, 1]
  },
  y: [-1, 1]
};

const rookOffsets: PieceOffsets = {
  x: [0, -1, 0, 1],
  y: [-1, 0, 1, 0]
};

const bishopOffsets: PieceOffsets = {
  x: [-1, -1, 1, 1],
  y: [-1, 1, -1, 1]
};

const adjacentOffsets: PieceOffsets = {
  x: rookOffsets.x.concat(bishopOffsets.x),
  y: rookOffsets.y.concat(bishopOffsets.y)
};

export const pieceOffsets: Readonly<Record<NonPawnPieceType, PieceOffsets>> = {
  [PieceType.KNIGHT]: {
    x: [-1, -2, -2, -1, 1, 2, 2, 1],
    y: [-2, -1, 1, 2, 2, 1, -1, -2]
  },
  [PieceType.BISHOP]: bishopOffsets,
  [PieceType.ROOK]: rookOffsets,
  [PieceType.QUEEN]: adjacentOffsets,
  [PieceType.KING]: adjacentOffsets
};