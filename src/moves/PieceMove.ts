import Board from "@/board/Board.ts";
import Move from "@/moves/Move.ts";
import Piece from "@/pieces/Piece.ts";

export default class PieceMove extends Move {
  // ===== ===== ===== ===== =====
  // PUBLIC
  // ===== ===== ===== ===== =====
  try(board: Board) {
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

  algebraicNotation(board: Board, legalMoves: Move[]) {
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

  #isAmbiguousWith({ srcCoords, destCoords }: Move, board: Board, srcPiece: Piece) {
    return destCoords === this.destCoords
      && srcCoords !== this.srcCoords
      && board.get(srcCoords) === srcPiece;
  }

  #exactNotation(board: Board, legalMoves: Move[], srcPiece: Piece) {
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

    if (!ambiguities.has("y"))
      return this.srcCoords.notation[0];

    if (!ambiguities.has("x"))
      return this.srcCoords.notation[1];

    return this.srcCoords.notation;
  }
}