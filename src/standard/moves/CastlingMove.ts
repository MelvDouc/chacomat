import Move from "@/base/moves/Move.ts";
import BaseBoard from "@/base/BaseBoard.ts";

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

  public try(board: BaseBoard) {
    const king = board.get(this.srcIndex)!;
    const rookDestIndex = this.destIndex - this.direction;
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

  public getAlgebraicNotation() {
    return this.isQueenSide()
      ? "0-0-0"
      : "0-0";
  }
}