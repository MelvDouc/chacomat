import Move from "@/moves/Move.ts";
import { ChacoMat } from "@/typings/chacomat.ts";

export default class PieceMove extends Move {
  // ===== ===== ===== ===== =====
  // PUBLIC
  // ===== ===== ===== ===== =====

  play(board: ChacoMat.Board) {
    board
      .set(this.destCoords, this.srcPiece)
      .delete(this.srcCoords);
  }

  undo(board: ChacoMat.Board) {
    this.capturedPiece
      ? board.set(this.destCoords, this.capturedPiece)
      : board.delete(this.destCoords);
    board.set(this.srcCoords, this.srcPiece);
  }

  algebraicNotation(position: ChacoMat.Position) {
    let notation = "";

    if (!this.srcPiece.isKing())
      notation += this.#exactNotation(position);

    if (position.board.has(this.destCoords)) notation += "x";
    return this.srcPiece.whiteInitial + notation + this.destCoords.notation;
  }

  // ===== ===== ===== ===== =====
  // PRIVATE
  // ===== ===== ===== ===== =====

  #exactNotation(position: ChacoMat.Position) {
    const ambiguities = new Set<string>();

    for (const { srcCoords, destCoords, srcPiece } of position.legalMoves) {
      if (srcCoords === this.srcCoords || destCoords !== this.destCoords || srcPiece !== this.srcPiece)
        continue;
      if (srcCoords.x === this.srcCoords.x)
        ambiguities.add("x");
      else if (srcCoords.y === this.srcCoords.y)
        ambiguities.add("y");
      else
        ambiguities.add("");
    }

    if (ambiguities.size === 0)
      return "";

    if (!ambiguities.has("x"))
      return this.srcCoords.fileName;

    if (!ambiguities.has("y"))
      return this.srcCoords.rankName;

    return this.srcCoords.notation;
  }
}