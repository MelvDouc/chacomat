import { IColor } from "@/typings/types.ts";

export default class Color implements IColor {
  // ===== ===== ===== ===== =====
  // STATIC PUBLIC
  // ===== ===== ===== ===== =====

  public static readonly WHITE = new this("w", -1);
  public static readonly BLACK = new this("b", 1);

  public static *cases() {
    yield this.WHITE;
    yield this.BLACK;
  }

  public static fromDirection(direction: number) {
    for (const color of this.cases())
      if (color.direction === direction)
        return color;
    throw new Error(`Invalid direction: ${direction}.`);
  }

  public static fromAbbreviation(abbreviation: string) {
    for (const color of this.cases())
      if (color.abbreviation === abbreviation)
        return color;
    throw new Error(`Invalid abbreviation: "${abbreviation}".`);
  }

  // ===== ===== ===== ===== =====
  // PUBLIC
  // ===== ===== ===== ===== =====

  public constructor(
    public readonly abbreviation: string,
    public readonly direction: number
  ) { }

  public get opposite() {
    return Color.fromDirection(-this.direction);
  }
}