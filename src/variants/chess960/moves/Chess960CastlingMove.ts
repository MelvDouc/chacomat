import type Board from "@/variants/standard/Board.ts";
import CastlingMove from "@/variants/standard/moves/CastlingMove.ts";

export default class Chess960CastlingMove extends CastlingMove {
  public override try(board: Board) {
    const king = board.get(this.srcIndex)!;
    const rook = board.get(this.destIndex)!;
    const kingDestIndex = board.castledKingIndex(king.color, this.direction);
    const rookDestIndex = board.castledRookIndex(king.color, this.direction);

    board
      .delete(this.srcIndex)
      .delete(this.destIndex)
      .set(kingDestIndex, king)
      .set(rookDestIndex, rook);

    return () => {
      board
        .delete(kingDestIndex)
        .delete(rookDestIndex)
        .set(this.srcIndex, king)
        .set(this.rookSrcIndex, rook);
    };
  }
}