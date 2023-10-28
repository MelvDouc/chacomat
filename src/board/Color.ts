import { ChacoMat } from "@/typings/chacomat.ts";

export default class Color {
  // ===== ===== ===== ===== =====
  // STATIC PUBLIC
  // ===== ===== ===== ===== =====

  static readonly WHITE = new this("white", -1);
  static readonly BLACK = new this("black", 1);

  static *cases() {
    yield this.WHITE;
    yield this.BLACK;
  }

  static fromDirection(direction: ChacoMat.Direction): Color {
    return this.#directionDict[direction];
  }

  static fromName(name: string) {
    return this.#nameDict[name];
  }

  static fromAbbreviation(abbreviation: string) {
    switch (abbreviation) {
      case "w":
        return this.WHITE;
      case "b":
        return this.BLACK;
      default:
        throw new Error(`Invalid color abbreviation: "${abbreviation}".`);
    }
  }

  // ===== ===== ===== ===== =====
  // STATIC PRIVATE
  // ===== ===== ===== ===== =====

  static readonly #nameDict: Record<string, Color> = {
    white: this.WHITE,
    black: this.BLACK
  };

  static readonly #directionDict: Record<number, Color> = {
    [-1]: this.WHITE,
    1: this.BLACK,
  };

  // ===== ===== ===== ===== =====
  // PUBLIC
  // ===== ===== ===== ===== =====

  readonly name: string;
  readonly #direction: ChacoMat.Direction;

  constructor(name: string, direction: ChacoMat.Direction) {
    this.name = name;
    this.#direction = direction;
  }

  get abbreviation() {
    return this.name[0];
  }

  get direction() {
    return this.#direction;
  }

  get opposite() {
    return Color.#directionDict[-this.#direction];
  }

  get pieceRank() {
    return this === Color.WHITE ? 7 : 0;
  }

  get pawnRank() {
    return this.pieceRank + this.#direction;
  }

  isWhite() {
    return this === Color.WHITE;
  }
}