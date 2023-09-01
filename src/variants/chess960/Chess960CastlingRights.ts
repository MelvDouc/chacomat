import Color from "@constants/Color.js";
import Coords from "@constants/Coords.js";
import CastlingRights from "@game/CastlingRights.js";

export default class Chess960CastlingRights extends CastlingRights {
  public static override fromString(str: string) {
    const castlingRights = new this();

    Coords.FILES.forEach((fileName) => {
      if (str.includes(fileName.toUpperCase()))
        castlingRights.addFile(Color.WHITE, Coords.fileNameToY(fileName.toLowerCase()));

      if (str.includes(fileName))
        castlingRights.addFile(Color.BLACK, Coords.fileNameToY(fileName));
    });

    return castlingRights;
  }

  public override toString(): string {
    let str = "";

    for (const file of this.files(Color.WHITE))
      str += Coords.yToFileName(file).toUpperCase();
    for (const file of this.files(Color.BLACK))
      str += Coords.yToFileName(file);

    return str || "-";
  }
}