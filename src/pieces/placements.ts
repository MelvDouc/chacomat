import { Color, Wing } from "@chacomat/utils/constants.js";
import { BlackAndWhite } from "@chacomat/types.js";

export const castledFiles = {
  KING: {
    [Wing.QUEEN_SIDE]: 2,
    [Wing.KING_SIDE]: 6
  },
  ROOK: {
    [Wing.QUEEN_SIDE]: 3,
    [Wing.KING_SIDE]: 5
  }
} as const;

export const startRanks = {
  PIECE: {
    [Color.WHITE]: 7,
    [Color.BLACK]: 0
  },
  PAWN: {
    [Color.WHITE]: 6,
    [Color.BLACK]: 1
  }
} as const;

export const middleRanks: BlackAndWhite<number> = {
  [Color.WHITE]: 4,
  [Color.BLACK]: 3
};

export const directions: BlackAndWhite<number> = {
  [Color.WHITE]: -1,
  [Color.BLACK]: 1
};