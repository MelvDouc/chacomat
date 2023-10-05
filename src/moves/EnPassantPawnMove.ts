import { coords } from "@/board/Coords.ts";
import Move from "@/moves/Move.ts";
import type { Board } from "@/typings/types.ts";

export default class EnPassantPawnMove extends Move {
  override algebraicNotation(): string {
    if (this.srcCoords.y !== this.destCoords.y)
      return `${this.srcCoords.notation[0]}x${this.destCoords.notation}`;
    return this.destCoords.notation;
  }

  override try(board: Board) {
    const srcPiece = board.get(this.srcCoords)!;
    const capturedPieceCoords = coords(this.srcCoords.x, this.destCoords.y);
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