import {
  bishopOffsets,
  blackPawnOffsets,
  knightOffsets,
  rookOffsets,
  royalOffsets,
  whitePawnOffsets
} from "@/constants/offsets.ts";
import PieceFactory, { absolutePieceValues } from "@/factories/PieceFactory.ts";

const Piece = PieceFactory({
  shortRangeValues: new Set([1, 2, 3]),
  pieces: {
    WHITE_PAWN: {
      value: absolutePieceValues.PAWN,
      initial: "P",
      offsets: whitePawnOffsets
    },
    WHITE_KING: {
      value: absolutePieceValues.KING,
      initial: "K",
      offsets: royalOffsets
    },
    WHITE_KNIGHT: {
      value: absolutePieceValues.KNIGHT,
      initial: "N",
      offsets: knightOffsets
    },
    WHITE_BISHOP: {
      value: absolutePieceValues.BISHOP,
      initial: "B",
      offsets: bishopOffsets
    },
    WHITE_ROOK: {
      value: absolutePieceValues.ROOK,
      initial: "R",
      offsets: rookOffsets
    },
    WHITE_QUEEN: {
      value: absolutePieceValues.QUEEN,
      initial: "Q",
      offsets: royalOffsets
    },
    BLACK_PAWN: {
      value: -absolutePieceValues.PAWN,
      initial: "p",
      offsets: blackPawnOffsets
    },
    BLACK_KING: {
      value: -absolutePieceValues.KING,
      initial: "k",
      offsets: royalOffsets
    },
    BLACK_KNIGHT: {
      value: -absolutePieceValues.KNIGHT,
      initial: "n",
      offsets: knightOffsets
    },
    BLACK_BISHOP: {
      value: -absolutePieceValues.BISHOP,
      initial: "b",
      offsets: bishopOffsets
    },
    BLACK_ROOK: {
      value: -absolutePieceValues.ROOK,
      initial: "r",
      offsets: rookOffsets
    },
    BLACK_QUEEN: {
      value: -absolutePieceValues.QUEEN,
      initial: "q",
      offsets: royalOffsets
    }
  }
});
export default Piece;