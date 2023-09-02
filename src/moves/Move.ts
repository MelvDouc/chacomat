import Coords from "@constants/Coords.js";
import type Board from "@game/Board.js";

export default class Move {
  public constructor(
    public readonly srcCoords: Coords,
    public readonly destCoords: Coords
  ) { }

  public play(board: Board): () => void {
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

  public getCapturedPiece(board: Board) {
    return board.get(this.destCoords);
  }

  public getComputerNotation(): string {
    return this.srcCoords.notation + this.destCoords.notation;
  }

  public getAlgebraicNotation(board: Board, legalMoves: Move[]): string {
    const notation = [board.get(this.srcCoords)!.initial.toUpperCase(), "", ""];

    for (const move of legalMoves) {
      if (
        move.srcCoords === this.srcCoords
        || move.destCoords !== this.destCoords
        || board.get(move.srcCoords) !== board.get(this.srcCoords)
      )
        continue;
      if (move.srcCoords.y === this.srcCoords.y) notation[2] = this.srcCoords.rankNotation;
      else notation[1] = this.srcCoords.fileNotation;
    }

    if (board.has(this.destCoords)) notation.push("x");
    notation.push(this.destCoords.notation);
    return notation.join("");
  }
}