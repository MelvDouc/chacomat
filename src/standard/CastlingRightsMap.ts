import Color from "@/constants/Color.ts";

export default class CastlingRightsMap extends Map<Color, Set<number>> {
  public static fromString(castlingStr: string, boardHeight: number, boardWidth: number) {
    const castlingRights = new this([
      [Color.WHITE, new Set()],
      [Color.BLACK, new Set()]
    ]);

    if (castlingStr.includes("q"))
      castlingRights.get(Color.BLACK)!.add(0);
    if (castlingStr.includes("k"))
      castlingRights.get(Color.BLACK)!.add(boardWidth - 1);
    if (castlingStr.includes("Q"))
      castlingRights.get(Color.WHITE)!.add(boardWidth * (boardHeight - 1));
    if (castlingStr.includes("k"))
      castlingRights.get(Color.WHITE)!.add(boardWidth * boardHeight - 1);

    return castlingRights;
  }

  declare public ["constructor"]: typeof CastlingRightsMap;

  public clone() {
    return new this.constructor([
      [Color.WHITE, new Set([...this.get(Color.WHITE)!])],
      [Color.BLACK, new Set([...this.get(Color.BLACK)!])]
    ]);
  }

  public override toString(boardHeight: number, boardWidth: number) {
    let castlingStr = "";

    if (this.get(Color.BLACK)!.has(boardWidth - 1))
      castlingStr += "k";
    if (this.get(Color.BLACK)!.has(0))
      castlingStr += "q";
    if (this.get(Color.WHITE)!.has(boardWidth * boardHeight - 1))
      castlingStr += "K";
    if (this.get(Color.WHITE)!.has(boardWidth * (boardHeight - 1)))
      castlingStr += "Q";

    return castlingStr || "-";
  }
}