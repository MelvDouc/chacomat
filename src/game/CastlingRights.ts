import { colors } from "@chacomat/constants/Color.js";
import type {
  BlackAndWhite,
  Color,
  Wings
} from "@chacomat/types.local.js";
import fenChecker from "@chacomat/utils/fen-checker.js";

/**
 * @classdesc Create an object that represents the castling rights in a position.
 * It is clonable and stringifiable.
 */
export default class CastlingRights {
  /**
   * The characters used in an FEN string to represent castling rights.
   */
  static readonly #initials: BlackAndWhite<Wings<string>> = {
    BLACK: {
      7: "k",
      0: "q"
    },
    WHITE: {
      7: "K",
      0: "Q"
    }
  };

  /**
   * Create an `CastlingRights` object from the castling portion of an FEN string.
   */
  static fromString(str: string): CastlingRights {
    const castlingRights = new CastlingRights();
    let wing: string;

    colors.forEach((color) => {
      for (wing in this.#initials[color]) {
        const initial = this.#initials[color][wing as keyof object];
        if (str.includes(initial))
          castlingRights[color].push(+wing);
      }
    });

    return castlingRights;
  }

  readonly WHITE: number[] = [];
  readonly BLACK: number[] = [];

  clone(): CastlingRights {
    const clone = Reflect.construct(this.constructor, []);
    clone.WHITE.push(...this.WHITE);
    clone.BLACK.push(...this.BLACK);
    return clone;
  }

  unset(color: Color, file: number): void {
    this[color].splice(this[color].indexOf(file), 1);
  }

  toString(): string {
    let str = "";

    colors.forEach((color) => {
      if (this[color].includes(7))
        str += CastlingRights.#initials[color][7];
      if (this[color].includes(0))
        str += CastlingRights.#initials[color][0];
    });

    return str || fenChecker.nullCharacter;
  }
}