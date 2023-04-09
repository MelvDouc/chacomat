import Colors, { Color } from "@src/constants/Colors.js";
import { Wing } from "@src/types.js";

export const InitialPieceRanks: Record<Color, number> = {
  [Colors.WHITE]: 7,
  [Colors.BLACK]: 0
} as const;

export const InitialPawnRanks: Record<Color, number> = {
  [Colors.WHITE]: 6,
  [Colors.BLACK]: 1
} as const;

export const CastledKingFiles: Record<Wing, number> = {
  [-1]: 2,
  [1]: 6
} as const;

export const CastledRookFiles: Record<Wing, number> = {
  [-1]: 3,
  [1]: 5
} as const;