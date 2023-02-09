import { AlgebraicSquareNotation } from "@chacomat/types.local.js";

export default class Coords {
  static #byXAndY = {} as Record<number, Record<number, Coords>>;
  static #byIndex = {} as Record<number, Coords>;
  static #byNotation = {} as Record<AlgebraicSquareNotation, Coords>;
  static #notationsByCoords = new Map<Coords, AlgebraicSquareNotation>();
  static #indicesByCoords = new Map<Coords, number>();

  static get(x: number, y: number) {
    return this.#byXAndY[x][y];
  }

  static fromNotation(notation: AlgebraicSquareNotation): Coords | undefined {
    return this.#byNotation[notation];
  }

  static isSafe(n: number): boolean {
    return n >= 0 && n < 8;
  }

  static xToRankName(x: number): string {
    return String(8 - x);
  }

  static yToFileName(x: number): string {
    return String.fromCharCode(97 + x);
  }

  static rankNameToX(rankName: string): number {
    return 8 - +rankName;
  }

  static fileNameToY(fileName: string): number {
    return fileName.charCodeAt(0) - 97;
  }

  static {
    for (let x = 0; x < 8; x++) {
      this.#byXAndY[x] = {};
      for (let y = 0; y < 8; y++) {
        const coords = new Coords(x, y);
        const index = x * 8 + y;
        const notation = this.yToFileName(y) + this.xToRankName(x) as AlgebraicSquareNotation;
        this.#byXAndY[x][y] = coords;
        this.#byIndex[index] = coords;
        this.#indicesByCoords.set(coords, index);
        this.#byNotation[notation] = coords;
        this.#notationsByCoords.set(coords, notation);
      }
    }
  }

  readonly x: number;
  readonly y: number;

  private constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  get index(): number {
    return Coords.#indicesByCoords.get(this);
  }

  get notation(): AlgebraicSquareNotation {
    return Coords.#notationsByCoords.get(this);
  }

  getPeer(xOffset: number, yOffset: number): Coords | null {
    const x = this.x + xOffset;
    const y = this.y + yOffset;
    if (Coords.isSafe(x) && Coords.isSafe(y))
      return Coords.get(x, y);
    return null;
  }
}