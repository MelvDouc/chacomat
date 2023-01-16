import type { AlgebraicSquareNotation } from "@chacomat/types.js";

export default class Coords {
  private static readonly all: Record<number, Record<number, Coords>> = {};
  private static readonly notations: Record<number, Record<number, AlgebraicSquareNotation>> = {};
  private static readonly coordsByNotation = {} as Record<AlgebraicSquareNotation, Coords>;

  public static getFileNameIndex(fileName: string): number {
    return fileName.toLowerCase().charCodeAt(0) - 97;
  }

  public static getFileName(file: number): string {
    return String.fromCharCode(97 + file);
  }

  public static fromNotation(notation: AlgebraicSquareNotation): Coords | null {
    return Coords.coordsByNotation[notation] ?? null;
  }

  public static get(x: number, y: number): Coords {
    return Coords.all[x][y];
  }

  public static isSafe(coordinate: number): boolean {
    return coordinate >= 0 && coordinate < 8;
  }

  public static isValidCoords(arg: any): arg is Coords {
    return typeof arg === "object"
      && arg !== null
      && arg.x in Coords.all
      && arg.y in Coords.all[arg.x];
  }

  static {
    for (let x = 0; x < 8; x++) {
      Coords.all[x] = {};
      Coords.notations[x] = {};
      for (let y = 0; y < 8; y++) {
        const coords = new Coords(x, y);
        const notation = Coords.getFileName(y) + String(8 - x) as AlgebraicSquareNotation;
        Coords.all[x][y] = coords;
        Coords.notations[x][y] = notation;
        Coords.coordsByNotation[notation] = coords;
      }
    }
  }

  readonly x: number;
  readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    Object.freeze(this);
  }

  public get notation(): AlgebraicSquareNotation {
    return Coords.notations[this.x][this.y];
  }

  public getPeer(xOffset: number, yOffset: number): Coords | null {
    const x = this.x + xOffset,
      y = this.y + yOffset;
    if (Coords.isSafe(x) && Coords.isSafe(y))
      return Coords.all[x][y];
    return null;
  }
}