import Coords from "@constants/Coords.js";
import Wing from "@constants/Wing.js";
import type Board from "@game/Board.js";
import Move from "@moves/Move.js";

export default class CastlingMove extends Move {
  private readonly rookSrcY: number;
  public readonly wing: Wing;

  public constructor(srcCoords: Coords, destCoords: Coords, rookSrcY: number, wing: Wing) {
    super(srcCoords, destCoords);
    this.rookSrcY = rookSrcY;
    this.wing = wing;
  }

  public override play(board: Board) {
    const king = board.get(this.srcCoords)!;
    // Differs from `this.destCoords` in chess 960.
    const kingDestCoords = Coords.get(this.srcCoords.x, this.wing.castledKingY);
    const rookSrcCoords = Coords.get(this.srcCoords.x, this.rookSrcY);
    const rookDestCoords = Coords.get(this.srcCoords.x, this.wing.castledRookY);
    const rook = board.get(rookSrcCoords)!;

    board.delete(this.srcCoords);
    board.set(kingDestCoords, king);
    board.delete(rookSrcCoords);
    board.set(rookDestCoords, rook);

    return () => {
      board.set(this.srcCoords, king);
      board.delete(kingDestCoords);
      board.set(rookSrcCoords, rook);
      board.delete(rookDestCoords);
    };
  }

  public override getAlgebraicNotation() {
    return this.wing === Wing.QUEEN_SIDE
      ? "0-0-0"
      : "0-0";
  }
}