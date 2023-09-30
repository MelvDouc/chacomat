import PawnMove from "@/base/moves/PawnMove.ts";
import { IBoard } from "@/typings/types.ts";

export default class EnPassantPawnMove extends PawnMove {
  public override try(board: IBoard) {
    const srcPiece = board.get(this.srcIndex)!;
    const capturedPieceIndex = board.coordsToIndex(
      board.indexToRank(this.srcIndex),
      board.indexToFile(this.destIndex)
    );
    const capturedPiece = board.get(capturedPieceIndex)!;

    board
      .set(this.destIndex, srcPiece)
      .delete(this.srcIndex)
      .delete(capturedPieceIndex);

    return () => {
      board
        .delete(this.destIndex)
        .set(this.srcIndex, srcPiece)
        .set(capturedPieceIndex, capturedPiece);
    };
  }
}