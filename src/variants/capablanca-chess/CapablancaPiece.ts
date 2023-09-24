import { diagonalOffsets, orthogonalOffsets } from "@/base/offsets.ts";
import Piece from "@/variants/standard/Piece.ts";

export default class CapablancaPiece extends Piece {
  protected static override readonly values = new Map<number, Piece>([...Piece.values]);
  protected static override readonly initials = new Map<string, Piece>([...Piece.initials]);

  public static override get Pieces() {
    return CapablancaPieces;
  }
}

const CapablancaPieces = {
  ...Piece.Pieces,
  WHITE_ARCHBISHOP: new CapablancaPiece({ value: 7, initial: "A", offsets: diagonalOffsets }),
  WHITE_CHANCELLOR: new CapablancaPiece({ value: 8, initial: "C", offsets: orthogonalOffsets }),
  BLACK_ARCHBISHOP: new CapablancaPiece({ value: -7, initial: "a", offsets: diagonalOffsets }),
  BLACK_CHANCELLOR: new CapablancaPiece({ value: -8, initial: "c", offsets: orthogonalOffsets })
} as const;