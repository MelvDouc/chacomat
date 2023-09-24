import type Chess960Board from "@/variants/chess960/Chess960Board.ts";
import CastlingMove from "@/variants/standard/moves/CastlingMove.ts";

export default class Chess960CastlingMove extends CastlingMove {
  public override try(board: Chess960Board) {
    const king = board.get(this.srcCoords)!;
    const rook = board.get(this.destCoords)!;
    const kingDestCoords = board.coords(this.srcCoords.x, board.castledKingFiles[this.direction as -1 | 1]);
    const rookDestCoords = kingDestCoords.peer(0, -this.direction)!;

    board
      .delete(this.srcCoords)
      .delete(this.destCoords)
      .set(kingDestCoords, king)
      .set(rookDestCoords, rook);

    return () => {
      board
        .delete(kingDestCoords)
        .delete(rookDestCoords)
        .set(this.srcCoords, king)
        .set(this.rookSrcCoords, rook);
    };
  }
}