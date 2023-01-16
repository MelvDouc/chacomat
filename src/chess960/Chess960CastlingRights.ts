import { Color } from "@chacomat/utils/constants.js";
import Coords from "@chacomat/game/Coords.js";
import CastlingRights from "@chacomat/game/CastlingRights.js";
import type {
  ChessFileName
} from "@chacomat/types.js";

export default class Chess960CastlingRights extends CastlingRights {
  private static readonly allowedFiles = {
    [Color.WHITE]: "ABCDEFGH",
    [Color.BLACK]: "abcdefgh"
  };

  public static override fromString(str: string): Chess960CastlingRights {
    const castlingRights = new Chess960CastlingRights();
    [...str].forEach((char) => {
      if (this.allowedFiles[Color.WHITE].includes(char))
        castlingRights[Color.WHITE].push(Coords.getFileNameIndex(char as Uppercase<ChessFileName>));
      if (this.allowedFiles[Color.BLACK].includes(char))
        castlingRights[Color.BLACK].push(Coords.getFileNameIndex(char as ChessFileName));
    });
    return castlingRights;
  }

  public override toString(): string {
    let str = "";

    this[Color.WHITE].forEach((file) => str += Coords.getFileName(file).toUpperCase());
    this[Color.BLACK].forEach((file) => str += Coords.getFileName(file));

    return str || Chess960CastlingRights.nullCastlingRightsChar;
  }
}