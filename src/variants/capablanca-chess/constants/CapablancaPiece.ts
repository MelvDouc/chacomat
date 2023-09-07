import Pieces, { Piece } from "@/constants/Pieces.ts";
import { bishopOffsets, knightOffsets, rookOffsets } from "@/constants/offsets.ts";

export default class CapablancaPiece extends Piece {
  public static override get Pieces() {
    return CapablancaPieces;
  }
}

const archbishopOffsets = {
  x: bishopOffsets.x.concat(knightOffsets.x),
  y: bishopOffsets.y.concat(knightOffsets.y)
};

const chancellorOffsets = {
  x: rookOffsets.x.concat(knightOffsets.x),
  y: rookOffsets.y.concat(knightOffsets.y)
};

const CapablancaPieces = {
  ...Pieces,
  WHITE_ARCHBISHOP: new CapablancaPiece(7, "A", archbishopOffsets),
  WHITE_CHANCELLOR: new CapablancaPiece(8, "C", chancellorOffsets),
  BLACK_ARCHBISHOP: new CapablancaPiece(-7, "a", archbishopOffsets),
  BLACK_CHANCELLOR: new CapablancaPiece(-8, "c", chancellorOffsets),
} as const;
