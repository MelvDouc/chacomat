import { ICoords } from "@/typings/types.ts";

export default class Coords implements ICoords {
  protected static readonly FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

  protected static readonly ALL = Array.from({ length: 8 }, (_, x) => {
    return Array.from({ length: 8 }, (_, y) => new Coords(x, y));
  });

  public static get(x: number, y: number) {
    return this.ALL[x][y];
  }

  public static fromNotation(notation: string) {
    return this.get(this.rankNameToX(notation[1]), this.fileNameToY(notation[0]));
  }

  public static isSafe(x: number, y: number) {
    return x >= 0 && x < 8 && y >= 0 && y < 8;
  }

  public static rankNameToX(rank: string) {
    return 8 - +rank;
  }

  public static fileNameToY(fileName: string) {
    return this.FILES.indexOf(fileName);
  }

  public static xToRankName(x: number) {
    return String(8 - x);
  }

  public static yToFileName(y: number) {
    return this.FILES[y];
  }

  declare public ["constructor"]: typeof Coords;

  protected constructor(
    public readonly x: number,
    public readonly y: number
  ) { }

  public get fileNotation() {
    return this.constructor.FILES[this.y];
  }

  public get rankNotation() {
    return this.constructor.xToRankName(this.x);
  }

  public get notation() {
    return this.fileNotation + this.rankNotation;
  }

  public isLightSquare() {
    return this.x % 2 === this.y % 2;
  }

  public peer(xOffset: number, yOffset: number) {
    const x = this.x + xOffset,
      y = this.y + yOffset;
    return this.constructor.isSafe(x, y)
      ? this.constructor.get(x, y)
      : null;
  }

  public *peers(xOffset: number, yOffset: number) {
    let coords = this.peer(xOffset, yOffset);

    while (coords) {
      yield coords;
      coords = coords.peer(xOffset, yOffset);
    }
  }
}