import BaseBoard from "@/base/BaseBoard.ts";
import BasePiece from "@/base/BasePiece.ts";
import Move from "@/base/moves/Move.ts";

export default class PawnMove extends Move {
  public promotedPiece: BasePiece | null = null;

  public constructor(
    public readonly srcIndex: number,
    public readonly destIndex: number
  ) {
    super();
  }

  public try(board: BaseBoard) {
    const srcPiece = board.get(this.srcIndex)!;
    const capturedPiece = board.get(this.destIndex);

    capturedPiece && board.delete(this.destIndex);
    board
      .set(this.destIndex, this.promotedPiece ?? srcPiece)
      .delete(this.srcIndex);

    return () => {
      board
        .set(this.srcIndex, srcPiece)
        .delete(this.destIndex);
      capturedPiece && board.set(this.destIndex, capturedPiece);
    };
  }

  public getAlgebraicNotation(board: BaseBoard) {
    const promotion = !this.promotedPiece ? "" : `=${this.promotedPiece.initial.toUpperCase()}`;
    if (this.isCapture(board))
      return `${board.getNotation(this.srcIndex)[0]}x${board.getNotation(this.destIndex) + promotion}`;
    return board.getNotation(this.destIndex) + promotion;
  }

  public override getComputerNotation(board: BaseBoard) {
    return super.getComputerNotation(board) + (this.promotedPiece?.initial.toUpperCase() ?? "");
  }

  public isCapture(board: BaseBoard) {
    return this.getSrcCoords(board).y !== this.getDestCoords(board).y;
  }

  public isDouble(boardHeight: number) {
    return Math.abs(this.srcIndex - this.destIndex) === boardHeight * 2;
  }

  public isPromotion(board: BaseBoard) {
    return this.getDestCoords(board).x === board.get(this.srcIndex)?.color.opposite.getPieceRank(board.height);
  }
}