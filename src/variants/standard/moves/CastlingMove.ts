import Move from "@/base/moves/Move.ts";
import type Board from "@/variants/standard/Board.ts";

export default class CastlingMove extends Move {
  public constructor(
    public readonly srcIndex: number,
    public readonly destIndex: number,
    public readonly rookSrcIndex: number
  ) {
    super();
  }

  public get direction() {
    return Math.sign(this.rookSrcIndex - this.srcIndex);
  }

  public isQueenSide() {
    return this.rookSrcIndex < this.srcIndex;
  }

  public try(board: Board) {
    const king = board.get(this.srcIndex)!;
    const rookDestIndex = board.castledRookIndex(king.color, this.direction);
    const rook = board.get(this.rookSrcIndex)!;

    board
      .delete(this.srcIndex)
      .set(this.destIndex, king)
      .delete(this.rookSrcIndex)
      .set(rookDestIndex, rook);

    return () => {
      board
        .set(this.srcIndex, king)
        .delete(this.destIndex)
        .set(this.rookSrcIndex, rook)
        .delete(rookDestIndex);
    };
  }

  public algebraicNotation() {
    return this.isQueenSide()
      ? "0-0-0"
      : "0-0";
  }
}