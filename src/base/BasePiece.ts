import Color from "@/constants/Color.ts";
import { PieceOffsets } from "@/types.ts";

export default abstract class BasePiece {
  protected static readonly values = new Map<number, BasePiece>();
  protected static readonly initials = new Map<string, BasePiece>();

  public static fromInitial(initial: string) {
    return this.initials.get(initial);
  }

  declare public ["constructor"]: typeof BasePiece;
  public readonly value: number;
  public readonly initial: string;
  public readonly color: Color;
  public readonly offsets: PieceOffsets;

  public constructor({ value, initial, offsets }: {
    value: number;
    initial: string;
    offsets: PieceOffsets;
  }) {
    this.value = value;
    this.initial = initial;
    this.color = initial === initial.toUpperCase() ? Color.WHITE : Color.BLACK;
    this.offsets = offsets;
    this.constructor.values.set(value, this);
    this.constructor.initials.set(initial, this);
  }

  public get opposite() {
    return this.constructor.values.get(-this.value)!;
  }

  public abstract isShortRange(): boolean;

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

  public toObject() {
    return {
      initial: this.initial,
      color: this.color.abbreviation
    };
  }
}