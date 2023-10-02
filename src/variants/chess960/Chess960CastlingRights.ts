import Color from "@/base/Color.ts";
import { FILES } from "@/utils/index-utils.ts";
import CastlingRights from "@/variants/standard/CastlingRights.ts";

export default class Chess960CastlingRights extends CastlingRights {
  // ===== ===== ===== ===== =====
  // STATIC PUBLIC
  // ===== ===== ===== ===== =====

  public static override fromString(castlingStr: string) {
    const castlingRights = new this();

    if (castlingStr !== "-") {
      for (const char of castlingStr) {
        if (char === char.toUpperCase())
          castlingRights.get(Color.WHITE).add(FILES.indexOf(char.toLowerCase()));
        else
          castlingRights.get(Color.BLACK).add(FILES.indexOf(char));
      }
    }

    return castlingRights;
  }

  // ===== ===== ===== ===== =====
  // PUBLIC
  // ===== ===== ===== ===== =====

  public override toString() {
    let castlingStr = "";

    for (const file of this.get(Color.BLACK))
      castlingStr += FILES[file];
    for (const file of this.get(Color.WHITE))
      castlingStr += FILES[file].toUpperCase();

    return castlingStr || "-";
  }
}