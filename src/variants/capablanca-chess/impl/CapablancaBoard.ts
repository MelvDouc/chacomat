import Board from "@/impl/Board.ts";
import { Coordinates } from "@/types/types.ts";
import CapablancaCoords from "@/variants/capablanca-chess/impl/CapablancaCoords.ts";
import CapablancaPiece from "@/variants/capablanca-chess/impl/CapablancaPiece.ts";

export default class CapablancaBoard extends Board {
  public static override Coords: typeof CapablancaCoords = CapablancaCoords;
  public static override PieceConstructor: typeof CapablancaPiece = CapablancaPiece;

  public override readonly width: number = 10;
  public override readonly castlingMultiplier: number = 3;
  public override readonly initialKingFile: number = 5;

  public override *attackedCoords(srcCoords: Coordinates) {
    const srcPiece = this.pieces.get(srcCoords)!;
    const { x: xOffsets, y: yOffsets } = srcPiece.offsets;

    for (let i = 0; i < xOffsets.length; i++) {
      const isKnightOffsets = (Math.abs(xOffsets[i]) === 2) !== (Math.abs(yOffsets[i]) === 2);
      for (const destCoords of srcCoords.peers(xOffsets[i], yOffsets[i])) {
        yield destCoords;
        if (srcPiece.isShortRange() || isKnightOffsets || this.hasCoords(destCoords))
          break;
      }
    }
  }
}