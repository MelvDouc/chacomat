import PieceMove from "@/game/moves/PieceMove.ts";
import { Board, Coordinates, Move } from "@/types/main-types.ts";

export default class CastlingMove implements Move {
  public constructor(
    public readonly srcCoords: Coordinates,
    public readonly destCoords: Coordinates,
    public readonly rookSrcY: number
  ) { }

  public get direction() {
    return Math.sign(this.rookSrcY - this.srcCoords.y);
  }

  public isQueenSide() {
    return this.rookSrcY < this.srcCoords.y;
  }

  public try(board: Board) {
    const king = board.getByCoords(this.srcCoords)!;
    const rookSrcCoords = board.Coords(this.srcCoords.x, this.rookSrcY);
    const rookDestCoords = this.destCoords.getPeer(0, -this.direction)!;
    const rook = board.getByCoords(rookSrcCoords)!;

    board
      .deleteCoords(this.srcCoords)
      .setByCoords(this.destCoords, king)
      .deleteCoords(rookSrcCoords)
      .setByCoords(rookDestCoords, rook);

    return () => {
      board
        .setByCoords(this.srcCoords, king)
        .deleteCoords(this.destCoords)
        .setByCoords(rookSrcCoords, rook)
        .deleteCoords(rookDestCoords);
    };
  }

  public getComputerNotation() {
    return PieceMove.prototype.getComputerNotation.apply(this);
  }

  public getAlgebraicNotation() {
    return this.isQueenSide()
      ? "0-0-0"
      : "0-0";
  }

  public toJson(board: Board, legalMoves: Move[]) {
    return PieceMove.prototype.toJson.apply(this, [board, legalMoves]);
  }
}