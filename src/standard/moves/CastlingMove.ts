import type BaseBoard from "@/base/BaseBoard.ts";
import type Coords from "@/base/Coords.ts";
import Move from "@/base/moves/Move.ts";

export default class CastlingMove extends Move {
  public constructor(
    public readonly srcCoords: Coords,
    public readonly destCoords: Coords,
    public readonly rookSrcCoords: Coords
  ) {
    super();
  }

  public get direction() {
    return Math.sign(this.rookSrcCoords.y - this.srcCoords.y);
  }

  public isQueenSide() {
    return this.rookSrcCoords.y < this.srcCoords.y;
  }

  public try(board: BaseBoard) {
    const king = board.get(this.srcCoords)!;
    const rookDestCoords = this.destCoords.peer(0, -this.direction)!;
    const rook = board.get(this.rookSrcCoords)!;

    board
      .delete(this.srcCoords)
      .set(this.destCoords, king)
      .delete(this.rookSrcCoords)
      .set(rookDestCoords, rook);

    return () => {
      board
        .set(this.srcCoords, king)
        .delete(this.destCoords)
        .set(this.rookSrcCoords, rook)
        .delete(rookDestCoords);
    };
  }

  public getAlgebraicNotation() {
    return this.isQueenSide()
      ? "0-0-0"
      : "0-0";
  }
}