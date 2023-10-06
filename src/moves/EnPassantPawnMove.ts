import { coords } from "@/board/Coords.ts";
import Move from "@/moves/Move.ts";
import { ChacoMat } from "@/typings/chacomat.ts";

export default class EnPassantPawnMove extends Move {
  override algebraicNotation(): string {
    if (this.srcCoords.x !== this.destCoords.x)
      return `${this.srcCoords.fileName}x${this.destCoords.notation}`;
    return this.destCoords.notation;
  }

  override try(board: ChacoMat.Board) {
    const srcPiece = board.get(this.srcCoords)!;
    const capturedPieceCoords = coords(this.destCoords.x, this.srcCoords.y);
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