import Color from "@/base/Color.ts";
import Coords from "@/base/Coords.ts";
import CastlingRights from "@/variants/standard/CastlingRights.ts";

export default class Chess960CastlingRights extends CastlingRights {
  public static override fromString(castlingStr: string) {
    const castlingRights = new this();

    if (castlingStr !== "-") {
      for (const char of castlingStr) {
        if (char === char.toUpperCase())
          castlingRights.get(Color.WHITE).add(Coords.fileNameToY(char.toLowerCase()));
        else
          castlingRights.get(Color.BLACK).add(Coords.fileNameToY(char));
      }
    }

    return castlingRights;
  }

  public override toString() {
    let castlingStr = "";

    for (const file of this.get(Color.BLACK))
      castlingStr += Coords.yToFileName(file);
    for (const file of this.get(Color.WHITE))
      castlingStr += Coords.yToFileName(file).toUpperCase();

    return castlingStr || "-";
  }
}