import { coords } from "@/board/Coords.ts";
import globalConfig from "@/global-config.ts";
import Move from "@/moves/Move.ts";
import { ChacoMat } from "@/typings/chacomat.ts";

export default class CastlingMove extends Move {
  readonly rookSrcCoords: ChacoMat.Coords;
  readonly rookDestCoords: ChacoMat.Coords;
  readonly direction: -1 | 1;

  constructor(srcCoords: ChacoMat.Coords, rookSrcX: number) {
    const direction = rookSrcX < srcCoords.x ? -1 : 1;

    super(srcCoords, srcCoords.peer(direction * 2, 0)!);
    this.direction = direction;
    this.rookSrcCoords = coords(rookSrcX, srcCoords.y);
    this.rookDestCoords = this.destCoords.peer(-this.direction, 0)!;
  }

  isQueenSide() {
    return this.rookSrcCoords.x < this.srcCoords.x;
  }

  try(board: ChacoMat.Board) {
    const king = board.get(this.srcCoords)!;
    const rook = board.get(this.rookSrcCoords)!;

    board
      .delete(this.srcCoords)
      .set(this.destCoords, king)
      .delete(this.rookSrcCoords)
      .set(this.rookDestCoords, rook);

    return () => {
      board
        .set(this.srcCoords, king)
        .delete(this.destCoords)
        .set(this.rookSrcCoords, rook)
        .delete(this.rookDestCoords);
    };
  }

  algebraicNotation() {
    const char = globalConfig.useZerosForCastling ? "0" : "O";
    return char + `-${char}`.repeat(this.isQueenSide() ? 2 : 1);
  }

  isLegal(board: ChacoMat.Board, attackedCoords: Set<ChacoMat.Coords>) {
    for (const coords of this.srcCoords.peers(this.direction, 0)) {
      if (board.has(coords) || attackedCoords.has(coords))
        return false;
      if (coords === this.destCoords)
        break;
    }

    // Rook square are also traversed by the king except for b1/b8.
    return !this.isQueenSide() || !board.has(this.rookSrcCoords.peer(1, 0)!);
  }
}