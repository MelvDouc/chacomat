import CastlingMove from "@/game/moves/CastlingMove.ts";
import { Board } from "@/types/main-types.ts";

export default class Chess960CastlingMove extends CastlingMove {
  public override try(board: Board) {
    const king = board.getByCoords(this.srcCoords)!;
    const rook = board.getByCoords(this.destCoords)!;
    const kingDestY = board.initialKingFile + board.castlingMultiplier * this.direction;
    const rookDestY = kingDestY - this.direction;

    board
      .deleteCoords(this.srcCoords)
      .set(this.srcCoords.x, kingDestY, king)
      .deleteCoords(this.destCoords)
      .set(this.srcCoords.x, rookDestY, rook);

    return () => {
      board
        .delete(this.srcCoords.x, kingDestY)
        .setByCoords(this.srcCoords, king)
        .delete(this.srcCoords.x, rookDestY)
        .setByCoords(this.destCoords, rook);
    };
  }
}