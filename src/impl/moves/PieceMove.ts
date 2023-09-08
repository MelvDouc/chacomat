import { Board, Coordinates, Move } from "@/types/types.ts";

export default class PieceMove implements Move {
  public constructor(
    public readonly srcCoords: Coordinates,
    public readonly destCoords: Coordinates
  ) { }

  public try(board: Board): () => void {
    const srcPiece = board.getByCoords(this.srcCoords)!;
    const destPiece = board.getByCoords(this.destCoords);
    board
      .setByCoords(this.destCoords, srcPiece)
      .deleteCoords(this.srcCoords);

    return () => {
      destPiece
        ? board.setByCoords(this.destCoords, destPiece)
        : board.deleteCoords(this.destCoords);
      board.setByCoords(this.srcCoords, srcPiece);
    };
  }

  public getComputerNotation() {
    return this.srcCoords.notation + this.destCoords.notation;
  }

  public getAlgebraicNotation(board: Board, legalMoves: Move[]) {
    const srcPiece = board.getByCoords(this.srcCoords)!;
    let notation = "";

    if (!srcPiece.isKing()) {
      for (const { srcCoords, destCoords } of legalMoves) {
        if (
          this.srcCoords === srcCoords
          || this.destCoords !== destCoords
          || board.getByCoords(srcCoords) !== srcPiece
        )
          continue;
        if (srcCoords.y === this.srcCoords.y) notation += this.srcCoords.rankNotation;
        else notation = this.srcCoords.fileNotation + notation;
      }
    }

    if (board.hasCoords(this.destCoords)) notation += "x";
    return srcPiece.initial.toUpperCase() + notation + this.destCoords.notation;
  }

  public toJson(board: Board, legalMoves: Move[]) {
    return {
      srcCoords: this.srcCoords.toJson(),
      destCoords: this.destCoords.toJson(),
      algebraicNotation: this.getAlgebraicNotation(board, legalMoves)
    };
  }
}