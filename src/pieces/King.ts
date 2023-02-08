import Piece from "@chacomat/pieces/Piece.js";
import { IndexGenerator, Wing } from "@chacomat/types.local.js";
import { coordsToIndex } from "@chacomat/utils/Index.js";

export default class King extends Piece {
  static override readonly offsets = {
    x: [0, -1, -1, -1, 0, 1, 1, 1],
    y: [-1, -1, 0, 1, 1, -1, 0, 1]
  };

  /**
   * This assumes that the king's coordinates are in keeping with the position's castling rights.
   */
  canCastleToFile(srcRookY: number): boolean {
    const { x: srcKingX, y: srcKingY } = this.getCoords();
    const wing = this.#getWing(srcKingY, srcRookY);
    const rookIndex = coordsToIndex(srcKingX, srcRookY);

    // The squares traversed by the king must not be attacked,
    // and they must be either empty or occupied by the castling rook.
    const destKingY = Piece.CASTLED_KING_FILES[wing];
    const kingDirection = Math.sign(destKingY - srcKingY);

    if (kingDirection !== 0) {
      for (let y = srcKingY + kingDirection; ; y += kingDirection) {
        const destIndex = coordsToIndex(srcKingX, y);
        if (
          this.getBoard().position.attackedIndicesSet.has(destIndex)
          || destIndex !== rookIndex && this.getBoard().has(destIndex)
        )
          return false;
        if (y === destKingY)
          break;
      }
    }

    // The squares traversed by the rook must be empty or occupied the king.
    const destRookY = Piece.CASTLED_ROOK_FILES[wing];
    const rookDirection = Math.sign(destRookY - srcRookY);

    if (rookDirection !== 0) {
      for (let y = srcRookY + rookDirection; ; y += rookDirection) {
        const destIndex = coordsToIndex(srcKingX, y);
        if (destIndex !== this.getIndex() && this.getBoard().has(destIndex))
          return false;
        if (y === destRookY)
          break;
      }
    }

    return true;
  }

  *castlingIndices(useChess960Rules: boolean): IndexGenerator {
    for (const wing of this.getBoard().position.castlingRights[this.color]) {
      if (this.canCastleToFile(wing)) {
        const y = useChess960Rules
          ? wing
          : Piece.CASTLED_KING_FILES[wing as Wing];
        yield coordsToIndex(this.getCoords().x, y);
      }
    }
  }

  #getWing(kingY: number, compareY: number): Wing {
    return (compareY < kingY) ? 0 : 7;
  }
}