import Color from "@/board/Color.ts";
import {
  blackPawnOffsets,
  diagonalOffsets,
  kingOffsets,
  knightOffsets,
  orthogonalOffsets,
  whitePawnOffsets
} from "@/pieces/offsets.ts";
import { JSONPiece, PieceOffsets } from "@/typings/types.ts";

export default class Piece {
  static readonly #values = new Map<number, Piece>();
  static readonly #initials = new Map<string, Piece>();
  static readonly #shortRangeValues = new Set([-1, -2, -3, 1, 2, 3]);

  static fromInitial(initial: string) {
    return this.#initials.get(initial);
  }

  readonly value: number;
  readonly initial: string;
  readonly color: Color;
  readonly #offsets: PieceOffsets;
  readonly #whiteInitial: string;

  constructor({ value, initial, offsets }: {
    value: number;
    initial: string;
    offsets: PieceOffsets;
  }) {
    this.value = value;
    this.initial = initial;
    this.#whiteInitial = initial.toUpperCase();
    this.color = initial === this.#whiteInitial ? Color.WHITE : Color.BLACK;
    this.#offsets = offsets;
    Piece.#values.set(value, this);
    Piece.#initials.set(initial, this);
  }

  get whiteInitial() {
    return this.#whiteInitial;
  }

  get offsets() {
    return this.#offsets;
  }

  get opposite() {
    return Piece.#values.get(-this.value)!;
  }

  isPawn() {
    return this.#whiteInitial === "P";
  }

  isKing() {
    return this.#whiteInitial === "K";
  }

  isKnight() {
    return this.#whiteInitial === "N";
  }

  isBishop() {
    return this.#whiteInitial === "B";
  }

  isRook() {
    return this.#whiteInitial === "R";
  }

  isQueen() {
    return this.#whiteInitial === "Q";
  }

  isShortRange() {
    return Piece.#shortRangeValues.has(this.value);
  }

  toJSON(): JSONPiece {
    return {
      initial: this.initial,
      color: this.color.abbreviation
    };
  }
}

export const Pieces = {
  WHITE_PAWN: new Piece({ value: 1, initial: "P", offsets: whitePawnOffsets }),
  WHITE_KING: new Piece({ value: 2, initial: "K", offsets: kingOffsets }),
  WHITE_KNIGHT: new Piece({ value: 3, initial: "N", offsets: knightOffsets }),
  WHITE_BISHOP: new Piece({ value: 4, initial: "B", offsets: diagonalOffsets }),
  WHITE_ROOK: new Piece({ value: 5, initial: "R", offsets: orthogonalOffsets }),
  WHITE_QUEEN: new Piece({ value: 6, initial: "Q", offsets: kingOffsets }),
  BLACK_PAWN: new Piece({ value: -1, initial: "p", offsets: blackPawnOffsets }),
  BLACK_KING: new Piece({ value: -2, initial: "k", offsets: kingOffsets }),
  BLACK_KNIGHT: new Piece({ value: -3, initial: "n", offsets: knightOffsets }),
  BLACK_BISHOP: new Piece({ value: -4, initial: "b", offsets: diagonalOffsets }),
  BLACK_ROOK: new Piece({ value: -5, initial: "r", offsets: orthogonalOffsets }),
  BLACK_QUEEN: new Piece({ value: -6, initial: "q", offsets: kingOffsets })
} as const;