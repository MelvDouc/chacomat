import PieceType from "@chacomat/constants/PieceType.js";
import type { PieceOffsets } from "@chacomat/types.local.js";

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

const pieceOffsets: Readonly<Record<PieceType, PieceOffsets>> = {
  [PieceType.PAWN]: {
    x: [1, 1],
    y: [-1, 1]
  },
  [PieceType.KNIGHT]: {
    x: [-1, -2, -2, -1, 1, 2, 2, 1],
    y: [-2, -1, 1, 2, 2, 1, -1, -2]
  },
  [PieceType.BISHOP]: bishopOffsets,
  [PieceType.ROOK]: rookOffsets,
  [PieceType.QUEEN]: adjacentOffsets,
  [PieceType.KING]: adjacentOffsets
};

export default pieceOffsets;