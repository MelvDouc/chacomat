import Color from "@constants/Color.js";

export default class CastlingRights {
  public static fromString(str: string): CastlingRights {
    const castlingRights = new this();

    if (str.includes("Q"))
      castlingRights.addFile(Color.WHITE, 0);
    if (str.includes("K"))
      castlingRights.addFile(Color.WHITE, 7);
    if (str.includes("q"))
      castlingRights.addFile(Color.BLACK, 0);
    if (str.includes("k"))
      castlingRights.addFile(Color.BLACK, 7);

    return castlingRights;
  }

  protected readonly map = new Map<Color, Set<number>>();

  public constructor() {
    this.map
      .set(Color.WHITE, new Set())
      .set(Color.BLACK, new Set());
  }

  public *files(color: Color) {
    yield* this.map.get(color)!.values();
  }

  public hasFile(color: Color, file: number): boolean {
    return this.map.get(color)?.has(file) === true;
  }

  public addFile(color: Color, file: number): void {
    this.map.get(color)?.add(file);
  }

  public removeFile(color: Color, file: number): void {
    this.map.get(color)?.delete(file);
  }

  public clear(color: Color): void {
    this.map.get(color)?.clear();
  }

  public clone(): CastlingRights {
    const clone = new CastlingRights();

    for (const color of Color.cases())
      for (const file of this.files(color))
        clone.addFile(color, file);

    return clone;
  }

  public toString() {
    let str = "";

    if (this.map.get(Color.BLACK)!.has(7))
      str += "k";
    if (this.map.get(Color.BLACK)!.has(0))
      str += "q";
    if (this.map.get(Color.WHITE)!.has(7))
      str += "K";
    if (this.map.get(Color.WHITE)!.has(0))
      str += "Q";

    return str || "-";
  }
}