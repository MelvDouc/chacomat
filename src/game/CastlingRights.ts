import Color from "@constants/Color.js";

export default class CastlingRights extends Map<Color, Set<number>> {
  public static fromString(str: string): CastlingRights {
    const castlingRights = new this();

    if (str.includes("Q"))
      castlingRights.get(Color.WHITE)!.add(0);
    if (str.includes("K"))
      castlingRights.get(Color.WHITE)!.add(7);
    if (str.includes("q"))
      castlingRights.get(Color.BLACK)!.add(0);
    if (str.includes("k"))
      castlingRights.get(Color.BLACK)!.add(7);

    return castlingRights;
  }

  public constructor() {
    super([
      [Color.WHITE, new Set()],
      [Color.BLACK, new Set()]
    ]);
  }

  public clone(): CastlingRights {
    const clone = new CastlingRights();

    for (const color of Color.cases())
      for (const file of this.get(color)!)
        clone.get(color)!.add(file);

    return clone;
  }

  public override toString() {
    let str = "";

    if (this.get(Color.BLACK)!.has(7))
      str += "k";
    if (this.get(Color.BLACK)!.has(0))
      str += "q";
    if (this.get(Color.WHITE)!.has(7))
      str += "K";
    if (this.get(Color.WHITE)!.has(0))
      str += "Q";

    return str || "-";
  }
}