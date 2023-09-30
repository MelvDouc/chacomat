import CapablancaPiece from "@/variants/capablanca-chess/CapablancaPiece.ts";
import Board from "@/variants/standard/Board.ts";

export default class CapablancaBoard extends Board {
  public override readonly castlingMultiplier: number = 3;
  public override readonly width: number = 10;

  public override *attackedIndices(srcIndex: number) {
    const srcPiece = this.pieces.get(srcIndex)!;

    if (srcPiece.isShortRange()) {
      yield* this.shortRangeAttackedIndices(srcIndex, srcPiece.offsets);
      return;
    }

    if (srcPiece instanceof CapablancaPiece)
      yield* this.shortRangeAttackedIndices(srcIndex, CapablancaPiece.Pieces.WHITE_KNIGHT.offsets);

    yield* this.longRangeAttackedIndices(srcIndex, srcPiece.offsets);
  }

  public override pieceFromInitial(initial: string) {
    return CapablancaPiece.fromInitial(initial);
  }

  // ===== ===== ===== ===== =====
  // PROTECTED
  // ===== ===== ===== ===== =====

  protected override readonly originalKingY: number = 5;
}