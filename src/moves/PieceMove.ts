import Move from "@/moves/Move.ts";
import { ChacoMat } from "@/typings/chacomat.ts";

export default class PieceMove extends Move {
  // ===== ===== ===== ===== =====
  // PUBLIC
  // ===== ===== ===== ===== =====
  try(board: ChacoMat.Board) {
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

  algebraicNotation(board: ChacoMat.Board, legalMoves: ChacoMat.Move[]) {
    const srcPiece = board.get(this.srcCoords)!;
    let notation = "";

    if (!srcPiece.isKing())
      notation += this.#exactNotation(board, legalMoves, srcPiece);

    if (board.has(this.destCoords)) notation += "x";
    return srcPiece.whiteInitial + notation + this.destCoords.notation;
  }

  // ===== ===== ===== ===== =====
  // PRIVATE
  // ===== ===== ===== ===== =====

  #isAmbiguousWith({ srcCoords, destCoords }: ChacoMat.Move, board: ChacoMat.Board, srcPiece: ChacoMat.Piece) {
    return destCoords === this.destCoords
      && srcCoords !== this.srcCoords
      && board.get(srcCoords) === srcPiece;
  }

  #exactNotation(board: ChacoMat.Board, legalMoves: Move[], srcPiece: ChacoMat.Piece) {
    const ambiguities = new Set<string>();

    for (const move of legalMoves) {
      if (!this.#isAmbiguousWith(move, board, srcPiece))
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