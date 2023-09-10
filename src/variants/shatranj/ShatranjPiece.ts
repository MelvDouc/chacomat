import BasePiece from "@/base/BasePiece.ts";
import {
  blackPawnOffsets,
  diagonalOffsets,
  kingOffsets,
  knightOffsets,
  orthogonalOffsets,
  whitePawnOffsets
} from "@/constants/offsets.ts";

export default class ShatranjPiece extends BasePiece {
  protected static readonly values = new Map<number, ShatranjPiece>();
  protected static readonly initials = new Map<string, ShatranjPiece>();

  public static get Pieces() {
    return ShatranjPieces;
  }

  public isShortRange() {
    return !this.isRook();
  }
}

const shatranjBishopOffsets = {
  x: diagonalOffsets.x.map((xOffset) => xOffset * 2),
  y: diagonalOffsets.y.map((yOffset) => yOffset * 2)
};

const ShatranjPieces = {
  WHITE_PAWN: new ShatranjPiece({ value: 1, initial: "P", offsets: whitePawnOffsets }),
  WHITE_KING: new ShatranjPiece({ value: 2, initial: "K", offsets: kingOffsets }),
  WHITE_KNIGHT: new ShatranjPiece({ value: 3, initial: "N", offsets: knightOffsets }),
  WHITE_BISHOP: new ShatranjPiece({ value: 4, initial: "B", offsets: shatranjBishopOffsets }),
  WHITE_ROOK: new ShatranjPiece({ value: 5, initial: "R", offsets: orthogonalOffsets }),
  WHITE_QUEEN: new ShatranjPiece({ value: 6, initial: "Q", offsets: diagonalOffsets }),
  BLACK_PAWN: new ShatranjPiece({ value: -1, initial: "p", offsets: blackPawnOffsets }),
  BLACK_KING: new ShatranjPiece({ value: -2, initial: "k", offsets: kingOffsets }),
  BLACK_KNIGHT: new ShatranjPiece({ value: -3, initial: "n", offsets: knightOffsets }),
  BLACK_BISHOP: new ShatranjPiece({ value: -4, initial: "b", offsets: shatranjBishopOffsets }),
  BLACK_ROOK: new ShatranjPiece({ value: -5, initial: "r", offsets: orthogonalOffsets }),
  BLACK_QUEEN: new ShatranjPiece({ value: -6, initial: "q", offsets: diagonalOffsets })
} as const;