import Wing from "../constants/Wing.js";
import Color from "../constants/Color.js";
import { BlackAndWhite } from "../types.js";

/**
 * @classdesc Create an object that represents the castling rights in a position.
 * It is clonable and stringifiable.
 */
export default class CastlingRights {
  /**
   * The characters used in an FEN string to represent castling rights.
   */
  private static readonly initials: BlackAndWhite<{ [W in Wing]: string }> = {
    [Color.BLACK]: {
      [Wing.KING_SIDE]: "k",
      [Wing.QUEEN_SIDE]: "q"
    },
    [Color.WHITE]: {
      [Wing.KING_SIDE]: "K",
      [Wing.QUEEN_SIDE]: "Q"
    }
  };

  /**
   * Create an `CastlingRights` object from the castling portion of an FEN string.
   */
  public static fromString(string: string): CastlingRights {
    const castlingRights = new CastlingRights();

    for (const color of [Color.WHITE, Color.BLACK])
      for (const wing of [Wing.QUEEN_SIDE, Wing.KING_SIDE])
        castlingRights[color][wing] = string.includes(CastlingRights.initials[color][wing]);

    return castlingRights;
  }

  public [Color.WHITE] = {
    [Wing.QUEEN_SIDE]: true,
    [Wing.KING_SIDE]: true
  };
  public [Color.BLACK] = {
    [Wing.QUEEN_SIDE]: true,
    [Wing.KING_SIDE]: true
  };

  public clone(): CastlingRights {
    const copy = new CastlingRights();
    copy[Color.WHITE] = { ...this[Color.WHITE] };
    copy[Color.BLACK] = { ...this[Color.BLACK] };
    return copy;
  }

  public toString(): string {
    let result = "";

    if (this[Color.WHITE][Wing.KING_SIDE])
      result += CastlingRights.initials[Color.WHITE][Wing.KING_SIDE];
    if (this[Color.WHITE][Wing.QUEEN_SIDE])
      result += CastlingRights.initials[Color.WHITE][Wing.QUEEN_SIDE];
    if (this[Color.BLACK][Wing.KING_SIDE])
      result += CastlingRights.initials[Color.BLACK][Wing.KING_SIDE];
    if (this[Color.BLACK][Wing.QUEEN_SIDE])
      result += CastlingRights.initials[Color.BLACK][Wing.QUEEN_SIDE];

    return result || "-";
  }
}