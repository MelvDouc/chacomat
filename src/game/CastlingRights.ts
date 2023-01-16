import { Color, Wing } from "@chacomat/utils/constants.js";
import type {
  BlackAndWhite,
  Wings
} from "@chacomat/types.js";

/**
 * @classdesc Create an object that represents the castling rights in a position.
 * It is clonable and stringifiable.
 */
export default class CastlingRights {
  protected static readonly nullCastlingRightsChar: string = "-";

  /**
   * The characters used in an FEN string to represent castling rights.
   */
  private static readonly initials: BlackAndWhite<Wings<string>> = {
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
  public static fromString(str: string): CastlingRights {
    const castlingRights = new CastlingRights();
    let colorKey: keyof typeof Color;

    for (colorKey in Color) {
      const color = Color[colorKey];
      if (str.includes(this.initials[color][Wing.QUEEN_SIDE]))
        castlingRights[Color[colorKey]].push(Wing.QUEEN_SIDE);
      if (str.includes(this.initials[color][Wing.KING_SIDE]))
        castlingRights[Color[colorKey]].push(Wing.KING_SIDE);
    }

    return castlingRights;
  }

  public readonly [Color.WHITE]: number[] = [];
  public readonly [Color.BLACK]: number[] = [];

  public clone(): CastlingRights {
    const clone = Reflect.construct(this.constructor, []);
    clone[Color.WHITE].push(...this[Color.WHITE]);
    clone[Color.BLACK].push(...this[Color.BLACK]);
    return clone;
  }

  public unset(color: Color, file: number): void {
    this[color].splice(this[color].indexOf(file), 1);
  }

  public toString(): string {
    let str = "";
    let colorKey: keyof typeof Color;

    for (colorKey in Color) {
      const color = Color[colorKey];
      if (this[color].includes(Wing.KING_SIDE))
        str += CastlingRights.initials[color][Wing.KING_SIDE];
      if (this[color].includes(Wing.QUEEN_SIDE))
        str += CastlingRights.initials[color][Wing.QUEEN_SIDE];
    }


    return str || CastlingRights.nullCastlingRightsChar;
  }
}