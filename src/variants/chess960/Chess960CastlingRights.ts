import Coords from "@/base/Coords.ts";
import Color from "@/constants/Color.ts";
import CastlingRights from "@/standard/CastlingRights.ts";

export default class Chess960CastlingRights extends CastlingRights {
  public static fromString(castlingStr: string) {
    const castlingRights = new this();

    for (const char of castlingStr) {
      if (char === char.toUpperCase())
        castlingRights.get(Color.WHITE).add(Coords.fileNameToY(char.toLowerCase()));
      else
        castlingRights.get(Color.BLACK).add(Coords.fileNameToY(char));
    }

    return castlingRights;
  }

  public toString() {
    let castlingStr = "";

    for (const file of this.get(Color.BLACK))
      castlingStr += Coords.yToFileName(file);
    for (const file of this.get(Color.WHITE))
      castlingStr += Coords.yToFileName(file).toUpperCase();

    return castlingStr || "-";
  }
}