import Color from "@constants/Color.js";
import {
  whitePawnOffsets,
  knightOffsets,
  royalOffsets,
  bishopOffsets,
  rookOffsets,
  blackPawnOffsets
} from "@constants/offsets.js";

export default class Piece {
  private static initialsMap = new Map<string, Piece>();

  public static readonly WHITE_PAWN = new this(1, "P");
  public static readonly WHITE_KNIGHT = new this(2, "N");
  public static readonly WHITE_KING = new this(3, "K");
  public static readonly WHITE_BISHOP = new this(4, "B");
  public static readonly WHITE_ROOK = new this(5, "R");
  public static readonly WHITE_QUEEN = new this(6, "Q");
  public static readonly BLACK_PAWN = new this(-1, "p");
  public static readonly BLACK_KNIGHT = new this(-2, "n");
  public static readonly BLACK_KING = new this(-3, "k");
  public static readonly BLACK_BISHOP = new this(-4, "b");
  public static readonly BLACK_ROOK = new this(-5, "r");
  public static readonly BLACK_QUEEN = new this(-6, "q");

  private static readonly offsets = {
    [this.WHITE_PAWN.value]: whitePawnOffsets,
    [this.WHITE_KNIGHT.value]: knightOffsets,
    [this.WHITE_KING.value]: royalOffsets,
    [this.WHITE_BISHOP.value]: bishopOffsets,
    [this.WHITE_ROOK.value]: rookOffsets,
    [this.WHITE_QUEEN.value]: royalOffsets,
    [this.BLACK_PAWN.value]: blackPawnOffsets,
    [this.BLACK_KNIGHT.value]: knightOffsets,
    [this.BLACK_KING.value]: royalOffsets,
    [this.BLACK_BISHOP.value]: bishopOffsets,
    [this.BLACK_ROOK.value]: rookOffsets,
    [this.BLACK_QUEEN.value]: royalOffsets
  };

  public static fromInitial(initial: string) {
    return this.initialsMap.get(initial) ?? null;
  }

  private constructor(
    public readonly value: number,
    public readonly initial: string,
  ) {
    Piece.initialsMap.set(initial, this);
  }

  public get color(): Color {
    return this.value < 0 ? Color.BLACK : Color.WHITE;
  }

  public get offsets(): { x: number[]; y: number[]; } {
    return Piece.offsets[this.value];
  }

  public isPawn() {
    return Math.abs(this.value) === Piece.WHITE_PAWN.value;
  }

  public isKnight() {
    return Math.abs(this.value) === Piece.WHITE_KNIGHT.value;
  }

  public isBishop() {
    return Math.abs(this.value) === Piece.WHITE_BISHOP.value;
  }

  public isRook() {
    return Math.abs(this.value) === Piece.WHITE_ROOK.value;
  }

  public isKing() {
    return Math.abs(this.value) === Piece.WHITE_KING.value;
  }

  public isShortRange() {
    return Math.abs(this.value) < Piece.WHITE_BISHOP.value;
  }

  public isWorth3() {
    return this.isKnight() || this.isBishop();
  }
}