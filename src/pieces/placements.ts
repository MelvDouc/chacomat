import { BlackAndWhite, Wings } from "@chacomat/types.local.js";

export const castledFiles: {
  KING: Wings<number>;
  ROOK: Wings<number>;
} = {
  KING: {
    0: 2,
    7: 6
  },
  ROOK: {
    0: 3,
    7: 5
  }
} as const;

export const startRanks: {
  PIECE: BlackAndWhite<number>;
  PAWN: BlackAndWhite<number>;
} = {
  PIECE: {
    WHITE: 7,
    BLACK: 0
  },
  PAWN: {
    WHITE: 6,
    BLACK: 1
  }
} as const;

export const middleRanks: BlackAndWhite<number> = {
  WHITE: 4,
  BLACK: 3
};

export const directions: BlackAndWhite<number> = {
  WHITE: -1,
  BLACK: 1
};