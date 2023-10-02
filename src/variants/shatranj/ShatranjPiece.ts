import Color from "@/base/Color.ts";
import {
  blackPawnOffsets,
  diagonalOffsets,
  kingOffsets,
  knightOffsets,
  orthogonalOffsets,
  whitePawnOffsets
} from "@/base/offsets.ts";
import { IColor, IPiece, PieceOffsets } from "@/typings/types.ts";

export default class ShatranjPiece implements IPiece {
  protected static readonly values = new Map<number, ShatranjPiece>();
  protected static readonly initials = new Map<string, ShatranjPiece>();
  protected static readonly offsets = new Map<string, PieceOffsets>();

  public static get Pieces() {
    return ShatranjPieces;
  }

  public static fromInitial(initial: string) {
    return this.initials.get(initial);
  }

  declare public ["constructor"]: typeof ShatranjPiece;
  public readonly value: number;
  public readonly initial: string;
  public readonly color: IColor;
  readonly #whiteInitial: string;

  public constructor({ value, initial, offsets }: {
    value: number;
    initial: string;
    offsets: PieceOffsets;
  }) {
    this.value = value;
    this.initial = initial;
    this.#whiteInitial = initial.toUpperCase();
    this.color = initial === this.#whiteInitial ? Color.WHITE : Color.BLACK;
    this.constructor.values.set(value, this);
    this.constructor.initials.set(initial, this);
    this.constructor.offsets.set(initial, offsets);
  }

  public get opposite() {
    return this.constructor.values.get(-this.value)!;
  }

  public get offsets() {
    return this.constructor.offsets.get(this.initial)!;
  }

  public isPawn() {
    return this.#whiteInitial === "P";
  }

  public isKing() {
    return this.#whiteInitial === "K";
  }

  public isKnight() {
    return this.#whiteInitial === "N";
  }

  public isBishop() {
    return this.#whiteInitial === "B";
  }

  public isRook() {
    return this.#whiteInitial === "R";
  }

  public isQueen() {
    return this.#whiteInitial === "Q";
  }

  public isShortRange() {
    return !this.isRook();
  }

  public toJSON() {
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