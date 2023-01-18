import type {
  AlgebraicSquareNotation,
  ChessFileName
} from "@chacomat/types.js";

export default class Coords {
  static readonly #all: Record<number, Record<number, { coords: Coords; notation: AlgebraicSquareNotation; }>> = {};
  static readonly #coordsByNotation = {} as Record<AlgebraicSquareNotation, Coords>;

  static getFileNameIndex(fileName: ChessFileName | Uppercase<ChessFileName>): number {
    return fileName.toLowerCase().charCodeAt(0) - 97;
  }

  static getFileName(file: number): ChessFileName {
    return String.fromCharCode(97 + file) as ChessFileName;
  }

  static fromNotation(notation: AlgebraicSquareNotation): Coords | null {
    return Coords.#coordsByNotation[notation] ?? null;
  }

  static get(x: number, y: number): Coords {
    return Coords.#all[x][y].coords;
  }

  static isSafe(coordinate: number): boolean {
    return coordinate >= 0 && coordinate < 8;
  }

  static {
    for (let x = 0; x < 8; x++) {
      Coords.#all[x] = {};
      for (let y = 0; y < 8; y++) {
        const coords = new Coords(x, y);
        const notation = Coords.getFileName(y) + String(8 - x) as AlgebraicSquareNotation;
        Coords.#all[x][y] = {
          coords,
          notation
        };
        Coords.#coordsByNotation[notation] = coords;
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

  get notation(): AlgebraicSquareNotation {
    return Coords.#all[this.x][this.y].notation;
  }

  getPeer(xOffset: number, yOffset: number): Coords | null {
    const x = this.x + xOffset,
      y = this.y + yOffset;
    if (Coords.isSafe(x) && Coords.isSafe(y))
      return Coords.#all[x][y].coords;
    return null;
  }
}