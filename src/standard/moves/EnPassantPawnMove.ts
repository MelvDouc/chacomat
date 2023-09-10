import BaseBoard from "@/base/BaseBoard.ts";
import PawnMove from "@/base/moves/PawnMove.ts";

export default class EnPassantPawnMove extends PawnMove {
  public override try(board: BaseBoard) {
    if (!this.isCapture(board) || board.has(this.destIndex))
      return super.try(board);

    const srcPiece = board.get(this.srcIndex);
    const capturedPieceCoords = board.coordsToIndex({
      x: this.getSrcCoords(board).x,
      y: this.getSrcCoords(board).y
    });
    const capturedPiece = board.get(capturedPieceCoords);

    board
      .set(this.destIndex, srcPiece)
      .delete(this.srcIndex)
      .delete(capturedPieceCoords);

    return () => {
      board
        .delete(this.destIndex)
        .set(this.srcIndex, srcPiece)
        .set(capturedPieceCoords, capturedPiece);
    };
  }
}