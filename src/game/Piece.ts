import {
  bishopOffsets,
  blackPawnOffsets,
  knightOffsets,
  rookOffsets,
  royalOffsets,
  whitePawnOffsets
} from "@/constants/offsets.ts";
import Color from "@/game/Color.ts";
import { Figure } from "@/types/main-types.ts";

export default class Piece implements Figure {
  protected static values = new Map<number, Figure>();
  protected static shortRangeValues = new Set([1, 2, 3]);

  public static get Pieces() {
    return Pieces;
  }

  public static fromInitial(initial: string) {
    return Object.values(this.Pieces).find((piece) => piece.initial === initial);
  }

  public readonly value: number;
  public readonly initial: string;
  public readonly color: Color;
  public readonly offsets: Figure["offsets"];

  public constructor({ value, initial, offsets }: {
    value: number;
    initial: string;
    offsets: Figure["offsets"];
  }) {
    this.value = value;
    this.initial = initial;
    this.color = initial === initial.toUpperCase() ? Color.WHITE : Color.BLACK;
    this.offsets = offsets;
    (this.constructor as typeof Piece).values.set(value, this);
  }

  public get opposite() {
    return (this.constructor as typeof Piece).values.get(-this.value)!;
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
    return (this.constructor as typeof Piece).shortRangeValues.has(Math.abs(this.value));
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

const Pieces = {
  WHITE_PAWN: new Piece({ value: 1, initial: "P", offsets: whitePawnOffsets }),
  WHITE_KING: new Piece({ value: 2, initial: "K", offsets: royalOffsets }),
  WHITE_KNIGHT: new Piece({ value: 3, initial: "N", offsets: knightOffsets }),
  WHITE_BISHOP: new Piece({ value: 4, initial: "B", offsets: bishopOffsets }),
  WHITE_ROOK: new Piece({ value: 5, initial: "R", offsets: rookOffsets }),
  WHITE_QUEEN: new Piece({ value: 6, initial: "Q", offsets: royalOffsets }),
  BLACK_PAWN: new Piece({ value: -1, initial: "p", offsets: blackPawnOffsets }),
  BLACK_KING: new Piece({ value: -2, initial: "k", offsets: royalOffsets }),
  BLACK_KNIGHT: new Piece({ value: -3, initial: "n", offsets: knightOffsets }),
  BLACK_BISHOP: new Piece({ value: -4, initial: "b", offsets: bishopOffsets }),
  BLACK_ROOK: new Piece({ value: -5, initial: "r", offsets: rookOffsets }),
  BLACK_QUEEN: new Piece({ value: -6, initial: "q", offsets: royalOffsets })
} as const;