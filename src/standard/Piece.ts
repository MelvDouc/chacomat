import {
  diagonalOffsets,
  kingOffsets
} from "@/constants/offsets.ts";
import ShatranjPiece from "@/variants/shatranj/ShatranjPiece.ts";

export default class Piece extends ShatranjPiece {
  protected static readonly values = new Map<number, Piece>([...ShatranjPiece.values]);
  protected static readonly initials = new Map<string, Piece>([...ShatranjPiece.initials]);

  public static get Pieces() {
    return Pieces;
  }

  public isShortRange() {
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