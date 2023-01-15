import { Color } from "@chacomat/utils/constants.js";
import Coords from "@chacomat/game/Coords.js";
import CastlingRights from "@chacomat/game/CastlingRights.js";

export default class Chess960CastlingRights extends CastlingRights {
  private static readonly allowedFiles = {
    [Color.WHITE]: "ABCDEFGH",
    [Color.BLACK]: "abcdefgh"
  };

  public static override fromString(str: string): Chess960CastlingRights {
    const castlingRights = new Chess960CastlingRights();
    [...str].forEach((char) => {
      for (const color of [Color.WHITE, Color.BLACK])
        if (this.allowedFiles[color].includes(char))
          castlingRights[color].push(Coords.getFileNameIndex(char));
    });
    return castlingRights;
  }

  public override toString(): string {
    let str = "";

    this[Color.WHITE].forEach((file) => str += Coords.getFileName(file));
    this[Color.BLACK].forEach((file) => str += Coords.getFileName(file));

    return str || Chess960CastlingRights.nullCastlingRightsChar;
  }
}