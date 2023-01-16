import { King } from "@chacomat/pieces/index.js";
import { CoordsGenerator, Wing } from "@chacomat/types.js";

export default class Chess960King extends King {
  // public override *castlingCoords(): CoordsGenerator {
  //   for (const srcRookY of this.board.position.castlingRights[this.color]) {
  //     if (this.canCastleToFile(this.getWing(srcRookY)))
  //       yield this.board.Coords.get(this.coords.x, srcRookY);
  //   }
  // }

  /*protected override canCastleToWing(wing: Wing): boolean {
    const { x: X, y: Y } = this.coords;
    const rookCoords = this.board.Coords.get(X, wing);

    // The squares traversed by the king must not be attacked,
    // and they must be either empty or occupied by the castling rook.
    const kingDirection = Math.sign(King.CASTLED_KING_FILES[wing] - Y);

    for (let y = Y + kingDirection; ; y += kingDirection) {
      const destCoords = this.board.Coords.get(X, y);
      if (this.board.position.attackedCoordsSet.has(destCoords) && destCoords !== rookCoords)
        return console.log(rookCoords, destCoords, "HERE1a"), false;
      if (this.board.has(destCoords) && destCoords !== rookCoords)
        return console.log(rookCoords, destCoords, wing, "HERE1b"), false;
      if (y === King.CASTLED_KING_FILES[wing])
        break;
    }

    // The squares traversed by the rook must be empty or occupied the king.
    const rookDirection = Math.sign(this.self.CASTLED_ROOK_FILES[wing] - rookCoords.y);

    for (let y = rookCoords.y + rookDirection; ; y += rookDirection) {
      const destCoords = this.board.Coords.get(X, y);
      if (this.board.has(destCoords) && destCoords !== this.coords)
        return console.log("HERE2"), false;
      if (y === this.self.CASTLED_ROOK_FILES[wing])
        break;
    }

    return true;
  }*/
}