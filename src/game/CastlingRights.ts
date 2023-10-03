import Color from "@/board/Color.ts";

export default class CastlingRights {
  static fromString(castlingStr: string) {
    const castlingRights = new this();

    if (castlingStr !== "-") {
      if (castlingStr.includes("q"))
        castlingRights.get(Color.BLACK).add(0);
      if (castlingStr.includes("k"))
        castlingRights.get(Color.BLACK).add(8 - 1);
      if (castlingStr.includes("Q"))
        castlingRights.get(Color.WHITE).add(0);
      if (castlingStr.includes("K"))
        castlingRights.get(Color.WHITE).add(8 - 1);
    }

    return castlingRights;
  }

  readonly #white: Set<number>;
  readonly #black: Set<number>;

  constructor(whiteFiles: number[] = [], blackFiles: number[] = []) {
    this.#white = new Set(whiteFiles);
    this.#black = new Set(blackFiles);
  }

  get(color: Color) {
    switch (color) {
      case Color.WHITE:
        return this.#white;
      case Color.BLACK:
        return this.#black;
      default:
        throw new Error(`Invalid color: ${color}.`);
    }
  }

  clone() {
    return new CastlingRights([...this.#white], [...this.#black]) as this;
  }

  toString() {
    let castlingStr = "";

    if (this.#black.has(8 - 1))
      castlingStr += "k";
    if (this.#black.has(0))
      castlingStr += "q";
    if (this.#white.has(8 - 1))
      castlingStr += "K";
    if (this.#white.has(0))
      castlingStr += "Q";

    return castlingStr || "-";
  }
}