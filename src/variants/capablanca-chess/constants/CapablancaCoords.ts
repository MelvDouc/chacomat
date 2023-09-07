import Coords from "@/constants/Coords.ts";

export default class CapablancaCoords extends Coords {
  protected static override readonly FILES = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
  public static override readonly BOARD_HEIGHT = 8;
  public static override readonly BOARD_WIDTH = 10;
  protected static override readonly all = Array.from({ length: this.BOARD_HEIGHT }, (_, x) => {
    return Array.from({ length: this.BOARD_WIDTH }, (_, y) => {
      return new this(x, y);
    });
  });

  public static override fromNotation(notation: string) {
    if (!/^[a-j][1-8]$/.test(notation))
      return null;

    return this.get(this.rankNameToX(notation[1]), this.fileNameToY(notation[0]));
  }
}