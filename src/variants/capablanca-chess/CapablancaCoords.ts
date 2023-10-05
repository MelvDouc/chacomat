import Coords from "@/base/Coords.ts";

export default class CapablancaCoords extends Coords {
  protected static readonly FILES = Coords.FILES.concat("i", "j");

  protected static readonly ALL = Array.from({ length: 8 }, (_, x) => {
    return Array.from({ length: 10 }, (_, y) => new CapablancaCoords(x, y));
  });

  public static fromNotation(notation: string) {
    return this.get(this.rankNameToX(notation.slice(1)), this.fileNameToY(notation[0]));
  }

  public static isSafe(x: number, y: number) {
    return x >= 0 && x < 8 && y >= 0 && y < 10;
  }
}