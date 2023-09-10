import Board from "@/international/Board.ts";
import { Coordinates } from "@/types/main-types.ts";
import CapablancaPiece from "@/variants/capablanca-chess/CapablancaPiece.ts";
import CoordsFactory from "@/variants/shatranj/factories/CoordsFactory.ts";

export default class CapablancaBoard extends Board {
  public static override Coords = CoordsFactory(8, 10);
  public static override PieceConstructor: typeof CapablancaPiece = CapablancaPiece;

  public override readonly width: number = 10;
  public override readonly castlingMultiplier: number = 3;
  public override readonly initialKingFile: number = 5;

  public override *attackedCoords(srcCoords: Coordinates) {
    if (this.pieces.get(srcCoords) instanceof CapablancaPiece)
      yield* this.shortRangePieceAttackedCoords(srcCoords, CapablancaPiece.Pieces.WHITE_KNIGHT.offsets);

    yield* super.attackedCoords(srcCoords);
  }

  public override clone() {
    const clone = new CapablancaBoard();
    this.pieces.forEach((piece, coords) => clone.setByCoords(coords, piece));
    return clone;
  }
}