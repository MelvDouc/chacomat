import Board from "@/game/Board.ts";
import CapablancaCoords from "@/variants/capablanca-chess/constants/CapablancaCoords.ts";
import CapablancaPiece from "@/variants/capablanca-chess/constants/CapablancaPiece.ts";

export default class CapablancaBoard extends Board {
  public override get castlingMultiplier() {
    return 3;
  }

  public override get initialKingFile() {
    return 5;
  }

  public override get Coords() {
    return CapablancaCoords;
  }

  public override get Piece() {
    return CapablancaPiece;
  }

  public override *attackedCoords(srcCoords: CapablancaCoords) {
    const srcPiece = this.get(srcCoords)!;
    const { x: xOffsets, y: yOffsets } = srcPiece.offsets;

    for (let i = 0; i < xOffsets.length; i++) {
      const isKnightOffsets = Math.abs(xOffsets[i]) === 2 || Math.abs(yOffsets[i]) === 2;
      for (const destCoords of srcCoords.peers(xOffsets[i], yOffsets[i])) {
        yield destCoords;
        if (srcPiece.isShortRange() || isKnightOffsets || this.has(destCoords))
          break;
      }
    }
  }
}