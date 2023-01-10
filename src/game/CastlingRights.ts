import Color from "../constants/Color.js";
import Wing from "../constants/Wing.js";
import { ICastlingRights } from "../types.js";

/**
 * The characters used in an FEN string to represent castling rights.
 */
const initials = {
  [Color.BLACK]: {
    [Wing.KING_SIDE]: "k",
    [Wing.QUEEN_SIDE]: "q",
  },
  [Color.WHITE]: {
    [Wing.KING_SIDE]: "K",
    [Wing.QUEEN_SIDE]: "Q",
  },
} as const;

/**
 * Create an object that represents the castling rights in a position.
 * It is clonable and stringifiable.
 */
export const CastlingRights = (): ICastlingRights => {
  return {
    [Color.BLACK]: {
      [Wing.KING_SIDE]: true,
      [Wing.QUEEN_SIDE]: true,
    },
    [Color.WHITE]: {
      [Wing.KING_SIDE]: true,
      [Wing.QUEEN_SIDE]: true,
    },
    clone(): ICastlingRights {
      const copy = CastlingRights();
      copy[Color.WHITE] = { ...this[Color.WHITE] };
      copy[Color.BLACK] = { ...this[Color.BLACK] };
      return copy;
    },
    toString(): string {
      let result = "";

      if (this[Color.WHITE][Wing.KING_SIDE]) {
        result += initials[Color.WHITE][Wing.KING_SIDE];
      }
      if (this[Color.WHITE][Wing.QUEEN_SIDE]) {
        result += initials[Color.WHITE][Wing.QUEEN_SIDE];
      }
      if (this[Color.BLACK][Wing.KING_SIDE]) {
        result += initials[Color.BLACK][Wing.KING_SIDE];
      }
      if (this[Color.BLACK][Wing.QUEEN_SIDE]) {
        result += initials[Color.BLACK][Wing.QUEEN_SIDE];
      }

      return result || "-";
    },
  };
};

/**
 * Create an `ICastlingRights` object from the castling portion of an FEN string.
 */
CastlingRights.fromString = (castlingString: string): ICastlingRights => {
  const castlingRights = CastlingRights();

  castlingRights[Color.WHITE][Wing.KING_SIDE] = castlingString.includes(
    initials[Color.WHITE][Wing.KING_SIDE],
  );
  castlingRights[Color.WHITE][Wing.QUEEN_SIDE] = castlingString.includes(
    initials[Color.WHITE][Wing.QUEEN_SIDE],
  );
  castlingRights[Color.BLACK][Wing.KING_SIDE] = castlingString.includes(
    initials[Color.BLACK][Wing.KING_SIDE],
  );
  castlingRights[Color.BLACK][Wing.QUEEN_SIDE] = castlingString.includes(
    initials[Color.BLACK][Wing.QUEEN_SIDE],
  );

  return castlingRights;
};


export default CastlingRights;
