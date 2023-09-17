import Board from "@/standard/Board.ts";
import CapablancaCoords from "@/variants/capablanca-chess/CapablancaCoords.ts";
import CapablancaPiece from "@/variants/capablanca-chess/CapablancaPiece.ts";

export default class CapablancaBoard extends Board {
  public get PieceConstructor() {
    return CapablancaPiece;
  }

  public get Coords() {
    return CapablancaCoords;
  }

  public readonly width: number = 10;
  public readonly castlingMultiplier: number = 3;

  public *attackedCoords(srcCoords: CapablancaCoords) {
    yield* super.attackedCoords(srcCoords);

    if (this.get(srcCoords) instanceof this.PieceConstructor) {
      const { x: xOffsets, y: yOffsets } = this.PieceConstructor.Pieces.WHITE_KNIGHT.offsets;
      for (let i = 0; i < xOffsets.length; i++) {
        const destCoords = srcCoords.peer(xOffsets[i], yOffsets[i]);
        if (destCoords) yield destCoords;
      }
    }
  }
}