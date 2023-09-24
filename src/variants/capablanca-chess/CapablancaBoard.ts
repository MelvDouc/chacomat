import CapablancaCoords from "@/variants/capablanca-chess/CapablancaCoords.ts";
import CapablancaPiece from "@/variants/capablanca-chess/CapablancaPiece.ts";
import Board from "@/variants/standard/Board.ts";

export default class CapablancaBoard extends Board {
  public static override getCoordsFromNotation(notation: string) {
    return CapablancaCoords.fromNotation(notation);
  }

  public override readonly width: number = 10;

  public override readonly castledKingFiles = {
    [-1]: 3,
    1: 8
  };
  public override readonly castledRookFiles = {
    [-1]: 4,
    1: 7
  };

  public override coords(x: number, y: number) {
    return CapablancaCoords.get(x, y);
  }

  public override *attackedCoords(srcCoords: CapablancaCoords) {
    const srcPiece = this.pieces.get(srcCoords)!;

    if (srcPiece.isShortRange()) {
      yield* this.shortRangeAttackedCoords(srcCoords, srcPiece.offsets);
      return;
    }

    if (srcPiece instanceof CapablancaPiece)
      yield* this.shortRangeAttackedCoords(srcCoords, CapablancaPiece.Pieces.WHITE_KNIGHT.offsets);

    yield* this.longRangeAttackedCoords(srcCoords, srcPiece.offsets);
  }

  public override pieceFromInitial(initial: string) {
    return CapablancaPiece.fromInitial(initial);
  }
}