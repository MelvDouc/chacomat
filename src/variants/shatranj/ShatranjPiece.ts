import Color from "@/constants/Color.ts";
import {
  blackPawnOffsets,
  diagonalOffsets,
  kingOffsets,
  knightOffsets,
  orthogonalOffsets,
  whitePawnOffsets
} from "@/constants/offsets.ts";

export default class ShatranjPiece {
  protected static values = new Map<number, ShatranjPiece>();

  public static get Pieces() {
    return ShatranjPieces;
  }

  public static fromInitial(initial: string) {
    return Object.values(this.Pieces).find((piece) => piece.initial === initial);
  }

  public readonly value: number;
  public readonly initial: string;
  public readonly color: Color;
  public readonly offsets: { x: number[]; y: number[]; };

  public constructor({ value, initial, offsets }: {
    value: number;
    initial: string;
    offsets: ShatranjPiece["offsets"];
  }) {
    this.value = value;
    this.initial = initial;
    this.color = initial === initial.toUpperCase() ? Color.WHITE : Color.BLACK;
    this.offsets = offsets;
    (this.constructor as typeof ShatranjPiece).values.set(value, this);
  }

  public get opposite() {
    return (this.constructor as typeof ShatranjPiece).values.get(-this.value)!;
  }

  public isPawn() {
    return this.initial.toUpperCase() === "P";
  }

  public isKing() {
    return this.initial.toUpperCase() === "K";
  }

  public isKnight() {
    return this.initial.toUpperCase() === "N";
  }

  public isBishop() {
    return this.initial.toUpperCase() === "B";
  }

  public isRook() {
    return this.initial.toUpperCase() === "R";
  }

  public isQueen() {
    return this.initial.toUpperCase() === "Q";
  }

  public isShortRange() {
    return Math.abs(this.value) !== ShatranjPieces.WHITE_ROOK.value;
  }

  /*
  public isPawn() {
    return Math.abs(this.value) === absolutePieceValues.PAWN;
  }

  public isKing() {
    return Math.abs(this.value) === absolutePieceValues.KING;
  }

  public isKnight() {
    return Math.abs(this.value) === absolutePieceValues.KNIGHT;
  }

  public isBishop() {
    return Math.abs(this.value) === absolutePieceValues.BISHOP;
  }

  public isRook() {
    return Math.abs(this.value) === absolutePieceValues.ROOK;
  }

  public isQueen() {
    return Math.abs(this.value) === absolutePieceValues.QUEEN;
  }
  */

  public toJson() {
    return {
      initial: this.initial,
      color: this.color.abbreviation
    };
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