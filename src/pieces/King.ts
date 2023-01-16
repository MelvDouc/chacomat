import Piece from "@chacomat/pieces/Piece.js";
import { Wing } from "@chacomat/utils/constants.js";
import { adjacentOffsets } from "@chacomat/utils/sliding-offsets.js";
import type { CoordsGenerator } from "@chacomat/types.js";

export default class King extends Piece {
  public static override readonly WHITE_INITIAL = Piece.WHITE_PIECE_INITIALS.KING;
  protected static override readonly OFFSETS = adjacentOffsets;

  /**
   * This assumes that the king's coordinates are in keeping with the position's castling rights.
   */
  protected canCastleToFile(srcRookY: number): boolean {
    const { x: X, y: Y } = this.coords;
    const wing = this.getWing(srcRookY);
    const rookCoords = this.board.Coords.get(X, srcRookY);

    // The squares traversed by the king must not be attacked,
    // and they must be either empty or occupied by the castling rook.
    const kingDirection = Math.sign(King.CASTLED_KING_FILES[wing] - Y);

    if (kingDirection !== 0) {
      for (let y = Y + kingDirection; ; y += kingDirection) {
        const destCoords = this.board.Coords.get(X, y);
        if (this.board.position.attackedCoordsSet.has(destCoords))
          return false;
        if (destCoords !== rookCoords && this.board.has(destCoords))
          return false;
        if (y === King.CASTLED_KING_FILES[wing])
          break;
      }
    }

    // The squares traversed by the rook must be empty or occupied the king.
    const rookDirection = Math.sign(Piece.CASTLED_ROOK_FILES[wing] - rookCoords.y);

    if (rookDirection !== 0) {
      for (let y = rookCoords.y + rookDirection; ; y += rookDirection) {
        const destCoords = this.board.Coords.get(X, y);
        if (destCoords !== this.coords && this.board.has(destCoords))
          return false;
        if (y === Piece.CASTLED_ROOK_FILES[wing])
          break;
      }
    }

    return true;
  }

  public *castlingCoords(): CoordsGenerator {
    for (const srcRookY of this.board.position.castlingRights[this.color]) {
      if (!this.canCastleToFile(srcRookY))
        continue;
      // Yield an empty file in regular chess and the castling rook's file in Chess960.
      const rookCoords = this.board.Coords.get(this.coords.x, srcRookY);
      yield (this.board.has(rookCoords))
        ? rookCoords
        : this.board.Coords.get(this.coords.x, King.CASTLED_KING_FILES[this.getWing(srcRookY)]);
    }
  }

  public getWing(y: number): Wing {
    return (y < this.coords.y)
      ? Wing.QUEEN_SIDE
      : Wing.KING_SIDE;
  }
}