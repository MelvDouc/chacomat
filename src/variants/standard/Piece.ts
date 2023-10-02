import {
  diagonalOffsets,
  kingOffsets
} from "@/base/offsets.ts";
import ShatranjPiece from "@/variants/shatranj/ShatranjPiece.ts";

export default class Piece extends ShatranjPiece {
  protected static override readonly values = new Map([...ShatranjPiece.values]);
  protected static override readonly initials = new Map([...ShatranjPiece.initials]);
  protected static override readonly offsets = new Map([...ShatranjPiece.offsets]);

  public static override get Pieces() {
    return Pieces;
  }

  public override isShortRange() {
    return Math.abs(this.value) < Pieces.WHITE_BISHOP.value;
  }
}

const ShatranjPieces = ShatranjPiece.Pieces;
const Pieces = {
  ...ShatranjPieces,
  WHITE_BISHOP: new Piece({ ...ShatranjPieces.WHITE_BISHOP, offsets: diagonalOffsets }),
  WHITE_QUEEN: new Piece({ ...ShatranjPieces.WHITE_QUEEN, offsets: kingOffsets }),
  BLACK_BISHOP: new Piece({ ...ShatranjPieces.BLACK_BISHOP, offsets: diagonalOffsets }),
  BLACK_QUEEN: new Piece({ ...ShatranjPieces.BLACK_QUEEN, offsets: kingOffsets })
} as const;