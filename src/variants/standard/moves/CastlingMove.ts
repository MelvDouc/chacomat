import Move from "@/base/moves/Move.ts";
import { IBoard, ICoords } from "@/typings/types.ts";

export default class CastlingMove extends Move {
  public constructor(
    public readonly srcCoords: ICoords,
    public readonly destCoords: ICoords,
    public readonly rookSrcCoords: ICoords
  ) {
    super();
  }

  public get direction() {
    return Math.sign(this.rookSrcCoords.y - this.srcCoords.y);
  }

  public isQueenSide() {
    return this.rookSrcCoords.y < this.srcCoords.y;
  }

  public try(board: IBoard) {
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

  public algebraicNotation() {
    return this.isQueenSide()
      ? "0-0-0"
      : "0-0";
  }
}