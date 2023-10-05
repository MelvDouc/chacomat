import Move from "@/moves/Move.ts";
import { Board, Coords } from "@/typings/types.ts";

export default class CastlingMove extends Move {
  readonly rookSrcCoords: Coords;
  readonly rookDestCoords: Coords;
  readonly direction: -1 | 1;

  constructor(
    srcCoords: Coords,
    destCoords: Coords,
    rookSrcCoords: Coords
  ) {
    super(srcCoords, destCoords);
    this.direction = Math.sign(rookSrcCoords.y - srcCoords.y) as -1 | 1;
    this.rookSrcCoords = rookSrcCoords;
    this.rookDestCoords = this.destCoords.peer(0, -this.direction)!;
  }

  isQueenSide() {
    return this.rookSrcCoords.y < this.srcCoords.y;
  }

  try(board: Board) {
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
    return this.isQueenSide()
      ? "0-0-0"
      : "0-0";
  }

  isLegal(board: Board, attackedCoords: Set<Coords>) {
    const direction = this.direction,
      rookMoves = this.isQueenSide() ? 3 : 2;

    for (let i = 1; i <= 2; i++) {
      const kingCoords = this.srcCoords.peer(0, direction * i)!;
      if (board.has(kingCoords) || attackedCoords.has(kingCoords))
        return false;
    }

    for (let i = 1; i <= rookMoves; i++) {
      const rookCoords = this.rookSrcCoords.peer(0, -direction * i)!;
      if (board.has(rookCoords))
        return false;
    }

    return true;
  }
}