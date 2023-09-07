import Color from "@/constants/Color.ts";
import {
  bishopOffsets,
  blackPawnOffsets,
  knightOffsets,
  rookOffsets,
  royalOffsets,
  whitePawnOffsets
} from "@/constants/offsets.ts";

class Piece {
  public static get Pieces() {
    return Pieces;
  }

  protected static readonly shortRangeValues = new Set([1, 2, 6]);

  public static fromValue(value: number): Piece | null {
    return Object.values(this.Pieces).find((piece) => piece.value === value) ?? null;
  }

  public static fromInitial(initial: string) {
    return Object.values(this.Pieces).find((piece) => piece.initial === initial) ?? null;
  }

  public constructor(
    public readonly value: number,
    public readonly initial: string,
    public readonly offsets: { x: number[]; y: number[]; }
  ) { }

  public get color(): Color {
    return this.value < 0 ? Color.BLACK : Color.WHITE;
  }

  public get opposite() {
    return Piece.fromValue(-this.value) as Piece;
  }

  public isPawn() {
    return Math.abs(this.value) === 1;
  }

  public isKnight() {
    return Math.abs(this.value) === 2;
  }

  public isBishop() {
    return Math.abs(this.value) === 3;
  }

  public isRook() {
    return Math.abs(this.value) === 4;
  }

  public isQueen() {
    return Math.abs(this.value) === 5;
  }

  public isKing() {
    return Math.abs(this.value) === 6;
  }

  public isShortRange() {
    return (this.constructor as typeof Piece).shortRangeValues.has(Math.abs(this.value));
  }

  public isWorth3() {
    return this.isKnight() || this.isBishop();
  }
}

const Pieces = {
  WHITE_PAWN: new Piece(1, "P", whitePawnOffsets),
  WHITE_KNIGHT: new Piece(2, "N", knightOffsets),
  WHITE_BISHOP: new Piece(3, "B", bishopOffsets),
  WHITE_ROOK: new Piece(4, "R", rookOffsets),
  WHITE_QUEEN: new Piece(5, "Q", royalOffsets),
  WHITE_KING: new Piece(6, "K", royalOffsets),
  BLACK_PAWN: new Piece(-1, "p", blackPawnOffsets),
  BLACK_KNIGHT: new Piece(-2, "n", knightOffsets),
  BLACK_BISHOP: new Piece(-3, "b", bishopOffsets),
  BLACK_ROOK: new Piece(-4, "r", rookOffsets),
  BLACK_QUEEN: new Piece(-5, "q", royalOffsets),
  BLACK_KING: new Piece(-6, "k", royalOffsets)
} as const;

export { Piece };
export default Pieces;