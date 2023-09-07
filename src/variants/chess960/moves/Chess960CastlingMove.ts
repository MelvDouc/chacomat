import type Board from "@/game/Board.ts";
import CastlingMove from "@/game/moves/CastlingMove.ts";

export default class Chess960CastlingMove extends CastlingMove {
  public override try(board: Board) {
    const king = board.get(this.srcCoords)!;
    const rook = board.get(this.destCoords)!;
    const kingDestCoords = board.Coords.get(this.srcCoords.x, board.initialKingFile + board.castlingMultiplier * this.direction)!;
    const rookSrcCoords = board.Coords.get(this.srcCoords.x, this.destCoords.y);
    const rookDestCoords = kingDestCoords.getPeer(0, -this.direction)!;

    board.delete(this.srcCoords);
    board.set(kingDestCoords, king);
    board.delete(rookSrcCoords);
    board.set(rookDestCoords, rook);

    return () => {
      board.delete(kingDestCoords);
      board.set(this.srcCoords, king);
      board.delete(rookDestCoords);
      board.set(rookSrcCoords, rook);
    };
  }
}