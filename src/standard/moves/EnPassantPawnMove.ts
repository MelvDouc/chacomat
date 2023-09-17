import type BaseBoard from "@/base/BaseBoard.ts";
import PawnMove from "@/base/moves/PawnMove.ts";

export default class EnPassantPawnMove extends PawnMove {
  public try(board: BaseBoard) {
    const srcPiece = board.get(this.srcCoords)!;
    const capturedPieceCoords = board.Coords.get(this.srcCoords.x, this.destCoords.y);
    const capturedPiece = board.get(capturedPieceCoords)!;

    board
      .set(this.destCoords, srcPiece)
      .delete(this.srcCoords)
      .delete(capturedPieceCoords);

    return () => {
      board
        .delete(this.destCoords)
        .set(this.srcCoords, srcPiece)
        .set(capturedPieceCoords, capturedPiece);
    };
  }
}