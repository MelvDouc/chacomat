import { bishopOffsets, knightOffsets, rookOffsets } from "@/constants/offsets.ts";
import Piece from "@/game/Piece.ts";
import { Figure } from "@/types/main-types.ts";

const archbishopOffsets = {
  x: bishopOffsets.x.concat(knightOffsets.x),
  y: bishopOffsets.y.concat(knightOffsets.y)
};

const chancellorOffsets = {
  x: rookOffsets.x.concat(knightOffsets.x),
  y: rookOffsets.y.concat(knightOffsets.y)
};

export default class CapablancaPiece extends Piece {
  protected static override values = new Map<number, Figure>([...Piece.values]);

  public static override get Pieces() {
    return CapablancaPieces;
  }
}

const CapablancaPieces = {
  ...Piece.Pieces,
  WHITE_ARCHBISHOP: new CapablancaPiece({ value: 7, initial: "A", offsets: archbishopOffsets }),
  WHITE_CHANCELLOR: new CapablancaPiece({ value: 8, initial: "C", offsets: chancellorOffsets }),
  BLACK_ARCHBISHOP: new CapablancaPiece({ value: -7, initial: "a", offsets: archbishopOffsets }),
  BLACK_CHANCELLOR: new CapablancaPiece({ value: -8, initial: "c", offsets: chancellorOffsets })
} as const;