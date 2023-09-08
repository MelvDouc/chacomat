import { bishopOffsets, knightOffsets, rookOffsets } from "@/constants/offsets.ts";
import PieceFactory from "@/factories/PieceFactory.ts";
import Piece from "@/impl/Piece.ts";

const archbishopOffsets = {
  x: bishopOffsets.x.concat(knightOffsets.x),
  y: bishopOffsets.y.concat(knightOffsets.y)
};

const chancellorOffsets = {
  x: rookOffsets.x.concat(knightOffsets.x),
  y: rookOffsets.y.concat(knightOffsets.y)
};

const CapablancaPiece = PieceFactory({
  shortRangeValues: new Set([1, 2, 3]),
  pieces: {
    ...Piece.Pieces,
    WHITE_ARCHBISHOP: {
      value: 7,
      initial: "A",
      offsets: archbishopOffsets
    },
    WHITE_CHANCELLOR: {
      value: 8,
      initial: "C",
      offsets: chancellorOffsets
    },
    BLACK_ARCHBISHOP: {
      value: -7,
      initial: "a",
      offsets: archbishopOffsets
    },
    BLACK_CHANCELLOR: {
      value: -8,
      initial: "c",
      offsets: chancellorOffsets
    }
  }
});

export default CapablancaPiece;