import File from "@chacomat/constants/File.js";
import CastlingRights from "@chacomat/game/CastlingRights.js";
import type { ChessFileName } from "@chacomat/types.local.js";
import fenChecker from "@chacomat/utils/fen-checker.js";

export default class Chess960CastlingRights extends CastlingRights {
  static override fromString(str: string): Chess960CastlingRights {
    const castlingRights = new Chess960CastlingRights();
    [...str].forEach((char) => {
      const initial = char.toLowerCase() as ChessFileName;
      const color = (initial === char) ? "BLACK" : "WHITE";
      castlingRights[color].push(File[initial]);
    });
    return castlingRights;
  }

  override toString(): string {
    let str = "";

    this.WHITE.forEach((fileIndex) => str += File[fileIndex].toUpperCase());
    this.BLACK.forEach((fileIndex) => str += File[fileIndex]);

    return str || fenChecker.nullCharacter;
  }
}