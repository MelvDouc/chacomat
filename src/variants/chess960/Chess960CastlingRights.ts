import Board from "@/game/Board.ts";
import CastlingRights from "@/game/CastlingRights.ts";
import Color from "@/game/Color.ts";

export default class Chess960CastlingRights extends CastlingRights {
  public static override fromString(str: string) {
    const castlingRights = new this();

    for (const fileName of str) {
      const color = fileName === fileName.toUpperCase() ? Color.WHITE : Color.BLACK;
      castlingRights.add(color, Board.Coords.fileNameToY(fileName.toLowerCase()));
    }

    return castlingRights;
  }

  public override toString() {
    let str = "";

    for (const file of this.files(Color.BLACK))
      str += Board.Coords.yToFileName(file);
    for (const file of this.files(Color.WHITE))
      str += Board.Coords.yToFileName(file).toUpperCase();

    return str || "-";
  }
}