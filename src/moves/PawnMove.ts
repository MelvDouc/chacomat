import EnPassantPawnMove from "@/moves/EnPassantPawnMove.ts";
import Move from "@/moves/Move.ts";
import Piece from "@/pieces/Piece.ts";
import type { ChacoMat } from "@/typings/chacomat.ts";

export default class PawnMove extends Move {
  promotedPiece: ChacoMat.Piece | null;

  constructor(
    srcCoords: ChacoMat.Coords,
    destCoords: ChacoMat.Coords,
    srcPiece: ChacoMat.Piece,
    capturedPiece: ChacoMat.Piece | null,
    promotedPiece: ChacoMat.Piece | null = null
  ) {
    super(srcCoords, destCoords, srcPiece, capturedPiece);
    this.promotedPiece = promotedPiece;
  }

  play(board: ChacoMat.Board) {
    board
      .set(this.destCoords, this.promotedPiece ?? this.srcPiece)
      .delete(this.srcCoords);
  }

  undo(board: ChacoMat.Board) {
    this.capturedPiece
      ? board.set(this.destCoords, this.capturedPiece)
      : board.delete(this.destCoords);
    board.set(this.srcCoords, this.srcPiece);
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

  *promotions(initials: string[]) {
    for (const initial of initials)
      yield new PawnMove(this.srcCoords, this.destCoords, this.srcPiece, this.capturedPiece, Piece.fromInitial(initial));
  }
}