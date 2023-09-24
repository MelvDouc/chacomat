import PawnMove from "@/base/moves/PawnMove.ts";
import { IBoard } from "@/typings/types.ts";

export default class EnPassantPawnMove extends PawnMove {
  public override try(board: IBoard) {
    const srcPiece = board.get(this.srcCoords)!;
    const capturedPieceCoords = board.coords(this.srcCoords.x, this.destCoords.y);
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