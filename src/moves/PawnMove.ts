import EnPassantPawnMove from "@/moves/EnPassantPawnMove.ts";
import Move from "@/moves/Move.ts";
import type { ChacoMat } from "@/typings/chacomat.ts";

export default class PawnMove extends Move {
  promotedPiece: ChacoMat.Piece | null;

  constructor(srcCoords: ChacoMat.Coords, destCoords: ChacoMat.Coords, promotedPiece: ChacoMat.Piece | null = null) {
    super(srcCoords, destCoords);
    this.promotedPiece = promotedPiece;
  }

  try(board: ChacoMat.Board) {
    const srcPiece = board.get(this.srcCoords)!;
    const destPiece = board.get(this.destCoords);

    board
      .set(this.destCoords, this.promotedPiece ?? srcPiece)
      .delete(this.srcCoords);

    return () => {
      destPiece
        ? board.set(this.destCoords, destPiece)
        : board.delete(this.destCoords);
      board.set(this.srcCoords, srcPiece);
    };
  }

  algebraicNotation() {
    const notation = EnPassantPawnMove.prototype.algebraicNotation.call(this);
    return (this.promotedPiece)
      ? `${notation}=${this.promotedPiece.whiteInitial}`
      : notation;
  }

  override computerNotation() {
    return super.computerNotation() + (this.promotedPiece?.whiteInitial ?? "");
  }

  isDouble() {
    return Math.abs(this.destCoords.y - this.srcCoords.y) === 2;
  }

  isPromotion() {
    return this.destCoords.y === 0 || this.destCoords.y === 8 - 1;
  }
}