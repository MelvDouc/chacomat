import CastlingRights from "@chacomat/game/CastlingRights.js";
import type { ChessFileName } from "@chacomat/types.js";
import Color from "@chacomat/utils/Color.js";
import { File } from "@chacomat/utils/constants.js";
import fenChecker from "@chacomat/utils/fen-checker.js";

export default class Chess960CastlingRights extends CastlingRights {
  public static override fromString(str: string): Chess960CastlingRights {
    const castlingRights = new Chess960CastlingRights();
    console.log(`castling str: ${str}`);
    [...str].forEach((char) => {
      const initial = char.toLowerCase() as ChessFileName;
      const color = (initial === char) ? Color.BLACK : Color.WHITE;
      castlingRights[color].push(File[initial]);
    });
    return castlingRights;
  }

  public override toString(): string {
    let str = "";

    this[Color.WHITE].forEach((fileIndex) => str += File[fileIndex].toUpperCase());
    this[Color.BLACK].forEach((fileIndex) => str += File[fileIndex]);

    return str || fenChecker.nullCharacter;
  }
}