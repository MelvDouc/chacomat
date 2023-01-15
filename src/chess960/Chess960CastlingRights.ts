import Coords from "@game/Coords.js";
import { Color } from "@utils/constants.js";

// TODO: make this inherit CastlingRights somehow
export default class Chess960CastlingRights {
  private static readonly allowedFiles = {
    [Color.WHITE]: "ABCDEFGH",
    [Color.BLACK]: "abcdefgh"
  };

  public static fromString(str: string): Chess960CastlingRights {
    const castlingRights = new Chess960CastlingRights();
    [...str].forEach((char) => {
      for (const color of [Color.WHITE, Color.BLACK])
        if (this.allowedFiles[color].includes(char))
          castlingRights[color].push(Coords.getFileNameIndex(char));
    });
    return castlingRights;
  }

  public readonly [Color.WHITE]: number[] = [];
  public readonly [Color.BLACK]: number[] = [];

  public clone(): Chess960CastlingRights {
    const clone = new Chess960CastlingRights();
    clone[Color.WHITE].push(...this[Color.WHITE]);
    clone[Color.BLACK].push(...this[Color.BLACK]);
    return clone;
  }

  public toString(): string {
    let str = "";

    this[Color.WHITE].forEach((file) => str += Coords.getFileName(file));
    this[Color.BLACK].forEach((file) => str += Coords.getFileName(file));

    return str || "-";
  }
}