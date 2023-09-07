import Color from "@/constants/Color.ts";
import Coords from "@/constants/Coords.ts";
import CastlingRights from "@/game/CastlingRights.ts";

export default class Chess960CastlingRights extends CastlingRights {
  public static override fromString(str: string) {
    const castlingRights = new this();

    for (const fileName of str) {
      const color = fileName === fileName.toUpperCase() ? Color.WHITE : Color.BLACK;
      castlingRights.add(color, Coords.fileNameToY(fileName.toLowerCase()));
    }

    return castlingRights;
  }

  public override toString(): string {
    let str = "";

    for (const file of this.files(Color.BLACK))
      str += Coords.yToFileName(file);
    for (const file of this.files(Color.WHITE))
      str += Coords.yToFileName(file).toUpperCase();

    return str || "-";
  }
}