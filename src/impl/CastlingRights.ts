import Color from "@/impl/Color.ts";

export default class CastlingRights {
  protected static readonly initials: Readonly<Record<string, [Color, number]>> = {
    k: [Color.BLACK, 8 - 1],
    q: [Color.BLACK, 0],
    K: [Color.WHITE, 8 - 1],
    Q: [Color.WHITE, 0]
  };

  public static fromString(str: string) {
    const castlingRights = new this();

    for (const initial in this.initials)
      if (str.includes(initial))
        castlingRights.add(...this.initials[initial]);

    return castlingRights;
  }

  protected readonly map: Map<Color, Set<number>>;

  public constructor() {
    this.map = new Map()
      .set(Color.WHITE, new Set())
      .set(Color.BLACK, new Set());
  }

  public *files(color: Color) {
    yield* this.map.get(color)!.values();
  }

  public has(color: Color, file: number) {
    return this.map.get(color)!.has(file) === true;
  }

  public add(color: Color, file: number) {
    this.map.get(color)!.add(file);
  }

  public remove(color: Color, file: number) {
    this.map.get(color)!.delete(file);
  }

  public clear(color: Color) {
    this.map.get(color)!.clear();
  }

  public clone() {
    const clone = new (this.constructor as typeof CastlingRights)();

    for (const color of Color.cases() as Generator<Color>)
      for (const file of this.map.get(color)!)
        clone.add(color, file);

    return clone;
  }

  public toString() {
    let str = "";
    const { initials } = this.constructor as typeof CastlingRights;

    for (const initial in initials)
      if (this.has(...initials[initial]))
        str += initial;

    return str || "-";
  }

  public toJson() {
    return [...Color.cases()].reduce((acc, color) => {
      acc[color.abbreviation] = [...this.files(color)];
      return acc;
    }, {} as Record<string, number[]>);
  }
}