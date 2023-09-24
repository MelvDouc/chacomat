import { IColor, ICoords } from "@/typings/types.ts";
import ShatranjBoard from "@/variants/shatranj/ShatranjBoard.ts";
import Piece from "@/variants/standard/Piece.ts";

export default class Board extends ShatranjBoard {
  public readonly castledKingFiles = {
    [-1]: 2,
    1: 6
  };
  public readonly castledRookFiles = {
    [-1]: 3,
    1: 5
  };

  public canCastle(rookSrcY: number, color: IColor, attackedCoords: Set<ICoords>): boolean {
    const kingSrcCoords = this.getKingCoords(color),
      direction = Math.sign(rookSrcY - kingSrcCoords.y) as -1 | 1,
      rookSrcCoords = this.coords(kingSrcCoords.x, rookSrcY);

    for (let coords = kingSrcCoords.peer(0, direction)!; ; coords = coords.peer(0, direction)!) {
      if (this.has(coords) && coords.y !== rookSrcY || attackedCoords.has(coords))
        return false;
      if (coords.y === this.castledKingFiles[direction]) break;
    }

    for (let coords = rookSrcCoords.peer(0, -direction)!; ; coords = coords.peer(0, -direction)!) {
      if (this.has(coords) && coords !== kingSrcCoords)
        return false;
      if (coords.y === this.castledRookFiles[direction]) break;
    }

    return true;
  }

  public override pieceFromInitial(initial: string) {
    return Piece.fromInitial(initial);
  }
}