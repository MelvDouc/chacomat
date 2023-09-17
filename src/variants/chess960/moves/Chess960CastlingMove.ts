import type Board from "@/standard/Board.ts";
import CastlingMove from "@/standard/moves/CastlingMove.ts";

export default class Chess960CastlingMove extends CastlingMove {
  public try(board: Board) {
    const king = board.get(this.srcCoords)!;
    const rook = board.get(this.destCoords)!;
    const kingDestCoords = board.getCastledKingCoords(king.color, this.destCoords.y);
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