import type Coords from "@/constants/Coords.ts";
import type Board from "@/game/Board.ts";
import Move from "@/game/moves/Move.ts";

export default class CastlingMove extends Move {
  public readonly rookSrcY: number;

  public constructor(
    srcCoords: Coords,
    destCoords: Coords,
    rookSrcY: number
  ) {
    super(srcCoords, destCoords);
    this.rookSrcY = rookSrcY;
  }

  public get direction() {
    return Math.sign(this.rookSrcY - this.srcCoords.y);
  }

  public isQueenSide() {
    return this.rookSrcY < this.srcCoords.y;
  }

  public try(board: Board) {
    const king = board.get(this.srcCoords)!;
    const rookSrcCoords = board.Coords.get(this.srcCoords.x, this.rookSrcY);
    const rookDestCoords = this.destCoords.getPeer(0, -this.direction)!;
    const rook = board.get(rookSrcCoords)!;

    board.delete(this.srcCoords);
    board.set(this.destCoords, king);
    board.delete(rookSrcCoords);
    board.set(rookDestCoords, rook);

    return () => {
      board.set(this.srcCoords, king);
      board.delete(this.destCoords);
      board.set(rookSrcCoords, rook);
      board.delete(rookDestCoords);
    };
  }

  public getAlgebraicNotation() {
    return this.isQueenSide()
      ? "0-0-0"
      : "0-0";
  }
}