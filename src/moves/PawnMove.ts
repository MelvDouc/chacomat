import type Board from "@game/Board.js";
import Coords from "@game/Coords.js";
import Move from "@moves/Move.js";

export default class PawnMove extends Move {
  public override play(board: Board) {
    const srcPiece = board.get(this.srcCoords)!;
    const capturedPieceCoords = this.getCapturedPieceCoords(board);
    const capturedPiece = board.get(capturedPieceCoords);

    capturedPiece && board.delete(capturedPieceCoords);
    board
      .set(this.destCoords, srcPiece)
      .delete(this.srcCoords);

    return () => {
      board
        .set(this.srcCoords, srcPiece)
        .delete(this.destCoords);
      capturedPiece && board.set(capturedPieceCoords, capturedPiece);
    };
  }

  protected getCapturedPieceCoords(board: Board) {
    return this.destCoords.y !== this.srcCoords.y && !board.get(this.destCoords)
      ? Coords.get(this.srcCoords.x, this.destCoords.y)
      : this.destCoords;
  }

  public override getCapturedPiece(board: Board) {
    return board.get(this.getCapturedPieceCoords(board));
  }

  public override getAlgebraicNotation() {
    if (this.destCoords.y !== this.srcCoords.y)
      return `${this.srcCoords.fileNotation}x${this.destCoords.notation}`;
    return this.destCoords.notation;
  }

  public isDouble() {
    return Math.abs(this.srcCoords.x - this.destCoords.x) === 2;
  }
}