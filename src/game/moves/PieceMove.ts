import type Board from "@/game/Board.ts";
import Move from "@/game/moves/Move.ts";

export default class PieceMove extends Move {
  public try(board: Board): () => void {
    const srcPiece = board.get(this.srcCoords)!;
    const destPiece = board.get(this.destCoords);
    board
      .set(this.destCoords, srcPiece)
      .delete(this.srcCoords);

    return () => {
      destPiece
        ? board.set(this.destCoords, destPiece)
        : board.delete(this.destCoords);
      board.set(this.srcCoords, srcPiece);
    };
  }

  public getAlgebraicNotation(board: Board, legalMoves: Move[]): string {
    const srcPiece = board.get(this.srcCoords)!;
    let notation = "";

    if (!srcPiece.isKing()) {
      for (const { srcCoords, destCoords } of legalMoves) {
        if (
          this.srcCoords === srcCoords
          || this.destCoords !== destCoords
          || board.get(srcCoords) !== srcPiece
        )
          continue;
        if (srcCoords.y === this.srcCoords.y) notation += this.srcCoords.rankNotation;
        else notation = this.srcCoords.fileNotation + notation;
      }
    }

    if (board.has(this.destCoords)) notation += "x";
    return srcPiece.initial.toUpperCase() + notation + this.destCoords.notation;
  }
}