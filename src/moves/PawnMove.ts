import EnPassantPawnMove from "@/moves/EnPassantPawnMove.ts";
import Move from "@/moves/Move.ts";
import type { Board, Coords, Piece } from "@/typings/types.ts";

export default class PawnMove extends Move {
  promotedPiece: Piece | null;

  constructor(srcCoords: Coords, destCoords: Coords, promotedPiece: Piece | null = null) {
    super(srcCoords, destCoords);
    this.promotedPiece = promotedPiece;
  }

  try(board: Board) {
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
    return Math.abs(this.destCoords.x - this.srcCoords.x) === 2;
  }

  isPromotion(board: Board) {
    return this.destCoords.x === board.get(this.srcCoords)!.color.opposite.pieceRank;
  }
}