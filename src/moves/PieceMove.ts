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

  algebraicNotation(board: ChacoMat.Board, legalMoves: ChacoMat.Move[]) {
    let notation = "";

    if (!this.srcPiece.isKing())
      notation += this.#exactNotation(board, legalMoves);

    if (board.has(this.destCoords)) notation += "x";
    return this.srcPiece.whiteInitial + notation + this.destCoords.notation;
  }

  // ===== ===== ===== ===== =====
  // PRIVATE
  // ===== ===== ===== ===== =====

  #isAmbiguousWith({ srcCoords, destCoords }: ChacoMat.Move, board: ChacoMat.Board) {
    return destCoords === this.destCoords && board.get(srcCoords) === this.srcPiece;
  }

  #exactNotation(board: ChacoMat.Board, legalMoves: Move[]) {
    const ambiguities = new Set<string>();

    for (const move of legalMoves) {
      if (move.srcCoords === this.srcCoords || !this.#isAmbiguousWith(move, board))
        continue;
      if (move.srcCoords.x === this.srcCoords.x)
        ambiguities.add("x");
      else if (move.srcCoords.y === this.srcCoords.y)
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