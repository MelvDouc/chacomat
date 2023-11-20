import Colors from "$src/constants/Colors.ts";
import { BOARD_WIDTH } from "$src/constants/dimensions.ts";

export const pieceRanks = {
  [Colors.WHITE]: 0,
  [Colors.BLACK]: BOARD_WIDTH - 1
};

export const pawnRanks = {
  [Colors.WHITE]: 1,
  [Colors.BLACK]: BOARD_WIDTH - 2
};