import { type Piece } from "@/constants/Pieces.ts";
import type Board from "@/game/Board.ts";
import Move from "@/game/moves/Move.ts";

export default class PawnMove extends Move {
  public promotedPiece: Piece | null = null;

  public try(board: Board) {
    const srcPiece = board.get(this.srcCoords)!;
    const capturedPieceCoords = this.getCapturedPieceCoords(board);
    const capturedPiece = board.get(capturedPieceCoords);

    capturedPiece && board.delete(capturedPieceCoords);
    board
      .set(this.destCoords, this.promotedPiece ?? srcPiece)
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
      ? board.Coords.get(this.srcCoords.x, this.destCoords.y)
      : this.destCoords;
  }

  public getCapturedPiece(board: Board) {
    return board.get(this.getCapturedPieceCoords(board));
  }

  public override getComputerNotation() {
    return super.getComputerNotation() + (this.promotedPiece?.initial?.toUpperCase() ?? "");
  }

  public getAlgebraicNotation() {
    const promotion = !this.promotedPiece ? "" : `=${this.promotedPiece.initial.toUpperCase()}`;
    if (this.destCoords.y !== this.srcCoords.y)
      return `${this.srcCoords.fileNotation}x${this.destCoords.notation + promotion}`;
    return this.destCoords.notation + promotion;
  }

  public isDouble() {
    return Math.abs(this.srcCoords.x - this.destCoords.x) === 2;
  }

  public isPromotion(board: Board) {
    return this.destCoords.x === board.get(this.srcCoords)?.color?.opposite?.getPieceRank(board.height);
  }
}