import Color from "@/constants/Color.ts";
import Board from "@/standard/Board.ts";
import CapablancaPiece from "@/variants/capablanca-chess/CapablancaPiece.ts";

export default class CapablancaBoard extends Board {
  public get PieceConstructor(): typeof CapablancaPiece {
    return CapablancaPiece;
  }

  public readonly width: number = 10;
  public readonly castlingMultiplier: number = 3;
  public readonly initialKingIndices = new Map([
    [Color.WHITE, 75],
    [Color.BLACK, 5]
  ]);

  public *attackedIndices(srcIndex: number) {
    yield* super.attackedIndices(srcIndex);

    if (this.get(srcIndex) instanceof this.PieceConstructor) {
      const { x: xOffsets, y: yOffsets } = this.PieceConstructor.Pieces.WHITE_KNIGHT.offsets;
      const srcCoords = this.indexToCoords(srcIndex);

      for (let i = 0; i < xOffsets.length; i++) {
        const destCoords = { x: srcCoords.x + xOffsets[i], y: srcCoords.y + yOffsets[i] };

        if (this.isCoordsSafe(destCoords))
          yield this.coordsToIndex(destCoords);
      }
    }
  }
}