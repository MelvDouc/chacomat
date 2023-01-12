import type { AlgebraicSquareNotation } from "../types.js";

export default class Coords {
  private static all: Record<number, Record<number, Coords>> = {};
  private static notations: Map<Coords, AlgebraicSquareNotation> = new Map();
  private static coordsByNotation: Map<AlgebraicSquareNotation, Coords> = new Map();

  public static fromNotation(notation: AlgebraicSquareNotation): Coords | null {
    return Coords.coordsByNotation.get(notation) ?? null;
  }

  public static get(x: number, y: number): Coords | null {
    if (x in Coords.all && y in Coords.all[x])
      return Coords.all[x][y];
    return null;
  }

  static {
    for (let x = 0; x < 8; x++) {
      Coords.all[x] = {};
      for (let y = 0; y < 8; y++) {
        const coords = new Coords(x, y);
        const notation = String.fromCharCode(97 + y) + String(8 - x) as AlgebraicSquareNotation;
        Coords.all[x][y] = coords;
        Coords.notations.set(coords, notation);
        Coords.coordsByNotation.set(notation, coords);
      }
    }
  }

  readonly x: number;
  readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public get notation(): AlgebraicSquareNotation {
    return Coords.notations.get(this)!;
  }

  public getPeer(xOffset: number, yOffset: number): Coords | null {
    return Coords.get(this.x + xOffset, this.y + yOffset);
  }
}