import Piece from "@src/constants/Piece.js";

const offsets = {
  [Piece.WHITE_PAWN]: {
    x: [-1, -1],
    y: [-1, 1]
  },
  [Piece.BLACK_PAWN]: {
    x: [1, 1],
    y: [-1, 1]
  },
  [Piece.KNIGHT]: {
    x: [-2, -2, -1, -1, 1, 1, 2, 2],
    y: [-1, 1, -2, 2, -2, 2, -1, 1]
  },
  [Piece.BISHOP]: {
    x: [-1, -1, 1, 1],
    y: [-1, 1, -1, 1]
  },
  [Piece.ROOK]: {
    x: [0, 0, -1, 1],
    y: [-1, 1, 0, 0]
  },
  [Piece.QUEEN]: {
    x: [0, -1, -1, -1, 0, 1, 1, 1],
    y: [-1, -1, 0, 1, 1, 1, 0, -1]
  },
  [Piece.KING]: {
    x: [0, -1, -1, -1, 0, 1, 1, 1],
    y: [-1, -1, 0, 1, 1, 1, 0, -1]
  }
} as const;

export default offsets;