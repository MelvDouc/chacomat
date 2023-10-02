import CapablancaPiece from "@/variants/capablanca-chess/CapablancaPiece.ts";
import Board from "@/variants/standard/Board.ts";

export default class CapablancaBoard extends Board {
  // ===== ===== ===== ===== =====
  // PUBLIC
  // ===== ===== ===== ===== =====

  public override readonly castlingMultiplier: number = 3;
  public override readonly width: number = 10;

  public override *attackedIndices(srcIndex: number) {
    yield* super.attackedIndices(srcIndex);

    if (this.pieces.get(srcIndex) instanceof CapablancaPiece) {
      const srcCoords = this.indexToCoords(srcIndex);
      const { x: xOffsets, y: yOffsets } = CapablancaPiece.Pieces.WHITE_KNIGHT.offsets;

      for (let i = 0; i < xOffsets.length; i++) {
        const x = srcCoords.x + xOffsets[i],
          y = srcCoords.y + yOffsets[i];
        if (this.isSafeCoords(x, y))
          yield this.coordsToIndex(x, y);
      }
    }
  }

  public override pieceFromInitial(initial: string) {
    return CapablancaPiece.fromInitial(initial);
  }

  // ===== ===== ===== ===== =====
  // PROTECTED
  // ===== ===== ===== ===== =====

  protected override readonly originalKingY: number = 5;
}