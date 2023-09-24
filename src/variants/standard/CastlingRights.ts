import Color from "@/base/Color.ts";

export default class CastlingRights {
  public static fromString(castlingStr: string, boardWidth: number) {
    const castlingRights = new this();

    if (castlingStr !== "-") {
      if (castlingStr.includes("q"))
        castlingRights.get(Color.BLACK).add(0);
      if (castlingStr.includes("k"))
        castlingRights.get(Color.BLACK).add(boardWidth - 1);
      if (castlingStr.includes("Q"))
        castlingRights.get(Color.WHITE).add(0);
      if (castlingStr.includes("K"))
        castlingRights.get(Color.WHITE).add(boardWidth - 1);
    }

    return castlingRights;
  }

  declare public ["constructor"]: typeof CastlingRights;
  protected readonly white: Set<number>;
  protected readonly black: Set<number>;

  public constructor(whiteFiles: number[] = [], blackFiles: number[] = []) {
    this.white = new Set(whiteFiles);
    this.black = new Set(blackFiles);
  }

  public get(color: Color) {
    return color === Color.WHITE ? this.white : this.black;
  }

  public clone() {
    return new this.constructor([...this.white], [...this.black]) as this;
  }

  public toString(boardHeight: number, boardWidth: number) {
    let castlingStr = "";

    if (this.black.has(boardWidth - 1))
      castlingStr += "k";
    if (this.black.has(0))
      castlingStr += "q";
    if (this.white.has(boardHeight - 1))
      castlingStr += "K";
    if (this.white.has(0))
      castlingStr += "Q";

    return castlingStr || "-";
  }
}