import SlidingPiece from "./SlidingPiece.js";
import Wing from "../../constants/Wing.js";
import type { Board, Coords } from "../../types.js";

export default class Rook extends SlidingPiece {
  public static readonly whiteInitial = "R";

  public static readonly offsets = {
    x: [0, -1, 1, 0],
    y: [-1, 0, 0, 1]
  };

  public isOnInitialSquare({ x, y }: Coords, board: Board): boolean {
    return x === Rook.startPieceRanks[this.color]
      && (
        y === board.startRookFiles[Wing.QUEEN_SIDE]
        || y === board.startRookFiles[Wing.KING_SIDE]
      );
  }
}