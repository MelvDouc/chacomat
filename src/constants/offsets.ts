import { BlackAndWhite } from "../types.js";
import Color from "./Color.js";
import PieceType from "./PieceType.js";

const pawnYOffsets = [-1, 1];

const rookOffsets = {
  x: [0, -1, 1, 0],
  y: [-1, 0, 0, 1],
};

const bishopOffsets = {
  x: [-1, -1, 1, 1],
  y: [-1, 1, -1, 1],
};

const adjacentOffsets = {
  x: rookOffsets.x.concat(bishopOffsets.x),
  y: rookOffsets.y.concat(bishopOffsets.y),
};

const pieceOffsets = {
  [PieceType.KNIGHT]: {
    x: [-2, -2, -1, -1, 1, 1, 2, 2],
    y: [-1, 1, -2, 2, -2, 2, -1, 1],
  },
  [PieceType.BISHOP]: bishopOffsets,
  [PieceType.ROOK]: rookOffsets,
  [PieceType.QUEEN]: adjacentOffsets,
  [PieceType.KING]: adjacentOffsets,
};

const offsets: BlackAndWhite<Record<PieceType, { x: number[]; y: number[] }>> =
  {
    [Color.WHITE]: {
      [PieceType.PAWN]: {
        x: [-Color.WHITE, -Color.WHITE] as number[],
        y: pawnYOffsets,
      },
      ...pieceOffsets,
    },
    [Color.BLACK]: {
      [PieceType.PAWN]: {
        x: [-Color.BLACK, -Color.BLACK] as number[],
        y: pawnYOffsets,
      },
      ...pieceOffsets,
    },
  };

export default offsets;
