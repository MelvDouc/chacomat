import { diagonalOffsets, orthogonalOffsets } from "@/constants/offsets.ts";
import Piece from "@/standard/Piece.ts";

export default class CapablancaPiece extends Piece {
  protected static readonly values = new Map<number, Piece>([...Piece.values]);
  protected static readonly initials = new Map<string, Piece>([...Piece.initials]);

  public static get Pieces() {
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