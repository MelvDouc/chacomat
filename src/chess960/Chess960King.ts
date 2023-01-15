import { King } from "@chacomat/pieces/index.js";
import { CoordsGenerator } from "@chacomat/types.js";

export default class Chess960King extends King {
  public override *castlingCoords(): CoordsGenerator {
    for (const srcRookY of this.board.position.castlingRights[this.color]) {
      if (this.canCastleToWing(this.getWing(srcRookY)))
        yield this.board.Coords.get(this.coords.x, srcRookY);
    }
  }
}