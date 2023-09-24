import Move from "@/base/moves/Move.ts";
import { IBoard, ICoords } from "@/typings/types.ts";

export default class PieceMove extends Move {
  public constructor(
    public readonly srcCoords: ICoords,
    public readonly destCoords: ICoords
  ) {
    super();
  }

  public try(board: IBoard) {
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

  public algebraicNotation(board: IBoard, legalMoves: Move[]) {
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