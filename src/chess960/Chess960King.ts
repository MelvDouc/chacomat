import { King } from "@chacomat/pieces/index.js";
import { Wing } from "@chacomat/utils/constants.js";
import { CoordsGenerator } from "@chacomat/types.js";

export default class Chess960King extends King {
  public override *castlingCoords(): CoordsGenerator {
    for (const srcRookY of this.board.position.castlingRights[this.color]) {
      const wing = (srcRookY < this.coords.y) ? Wing.QUEEN_SIDE : Wing.KING_SIDE;
      if (this.canCastleToWing(wing))
        yield this.board.Coords.get(this.coords.x, srcRookY);
    }
  }
}