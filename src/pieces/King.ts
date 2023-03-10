import Piece from "@chacomat/pieces/Piece.js";
import { Board, CoordsGenerator, Wing } from "@chacomat/types.local.js";
import Coords from "@chacomat/utils/Coords.js";

export default class King extends Piece {
  static override readonly offsets = {
    x: [0, -1, -1, -1, 0, 1, 1, 1],
    y: [-1, -1, 0, 1, 1, -1, 0, 1]
  };

  /**
   * This assumes that the king's coordinates are in keeping with the position's castling rights.
   */
  canCastleToFile(srcRookY: number, board: Board): boolean {
    const { x: srcKingX, y: srcKingY } = this.coords;
    const wing = this.#getWing(srcKingY, srcRookY);
    const rookCoords = Coords.get(srcKingX, srcRookY);

    // The squares traversed by the king must not be attacked,
    // and they must be either empty or occupied by the castling rook.
    const destKingY = Piece.CASTLED_KING_FILES[wing];
    const kingDirection = Math.sign(destKingY - srcKingY);

    if (kingDirection !== 0) {
      for (let y = srcKingY + kingDirection; ; y += kingDirection) {
        const destCoords = Coords.get(srcKingX, y);
        if (
          board.position.attackedCoords.has(destCoords)
          || y !== rookCoords.y && board.has(destCoords)
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
        const destCoords = Coords.get(srcKingX, y);
        if (y !== this.y && board.has(destCoords))
          return false;
        if (y === destRookY)
          break;
      }
    }

    return true;
  }

  *castlingCoords(useChess960Rules: boolean, board: Board): CoordsGenerator {
    for (const wing of board.position.castlingRights[this.color]) {
      if (this.canCastleToFile(wing, board)) {
        const y = useChess960Rules
          ? wing
          : Piece.CASTLED_KING_FILES[wing as Wing];
        yield Coords.get(this.x, y);
      }
    }
  }

  #getWing(kingY: number, compareY: number): Wing {
    return (compareY < kingY) ? 0 : 7;
  }
}