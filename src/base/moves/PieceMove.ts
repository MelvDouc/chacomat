import type BaseBoard from "@/base/BaseBoard.ts";
import type Coords from "@/base/Coords.ts";
import Move from "@/base/moves/Move.ts";

export default class PieceMove extends Move {
  public constructor(
    public readonly srcCoords: Coords,
    public readonly destCoords: Coords
  ) {
    super();
  }

  public try(board: BaseBoard) {
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

  public getAlgebraicNotation(board: BaseBoard, legalMoves: Move[]) {
    const srcPiece = board.get(this.srcCoords)!;
    let notation = "";

    if (!srcPiece.isKing()) {
      const ambiguousMoves = legalMoves.filter(({ srcCoords, destCoords }) => {
        return destCoords === this.destCoords && srcCoords !== this.srcCoords && board.get(srcCoords) === srcPiece;
      });
      if (ambiguousMoves.length) {
        const aloneOnFile = !ambiguousMoves.some(({ srcCoords }) => srcCoords.y === this.srcCoords.y);
        if (!aloneOnFile)
          notation += this.srcCoords.rankNotation;
        if (ambiguousMoves.some(({ srcCoords }) => srcCoords.x === this.srcCoords.x) || aloneOnFile)
          notation = this.srcCoords.fileNotation + notation;
      }
    }

    if (board.has(this.destCoords)) notation += "x";
    return srcPiece.initial.toUpperCase() + notation + this.destCoords.notation;
  }
}