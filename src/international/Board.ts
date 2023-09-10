import Color from "@/constants/Color.ts";
import Piece from "@/international/Piece.ts";
import { Coordinates } from "@/types/main-types.ts";
import ShatranjBoard from "@/variants/shatranj/ShatranjBoard.ts";

export default class Board extends ShatranjBoard {
  public static override readonly PieceConstructor: typeof Piece = Piece;

  public readonly castlingMultiplier: number = 2;

  /**
   * Yield the coords between `srcCoords` (exclusive) and `destCoords` (inclusive).
   */
  protected *coordsBetween(srcCoords: Coordinates, destCoords: Coordinates) {
    const xOffset = Math.sign(destCoords.x - srcCoords.x);
    const yOffset = Math.sign(destCoords.y - srcCoords.y);

    for (const peer of srcCoords.peers(xOffset, yOffset)) {
      yield peer;
      if (peer === destCoords)
        break;
    }
  }

  public canCastle(rookSrcY: number, color: Color, attackedCoordsSet: Set<Coordinates>): boolean {
    const kingSrcCoords = this.getKingCoords(color),
      direction = Math.sign(rookSrcY - kingSrcCoords.y),
      kingDestCoords = this.Coords(kingSrcCoords.x, this.initialKingFile + this.castlingMultiplier * direction),
      rookSrcCoords = this.Coords(kingSrcCoords.x, rookSrcY),
      rookDestCoords = kingDestCoords.getPeer(0, -direction)!;

    if (kingSrcCoords !== kingDestCoords)
      for (const coords of this.coordsBetween(kingSrcCoords, kingDestCoords))
        if (this.hasCoords(coords) && coords !== rookSrcCoords || attackedCoordsSet.has(coords))
          return false;

    if (rookSrcCoords !== rookDestCoords)
      for (const coords of this.coordsBetween(rookSrcCoords, rookDestCoords))
        if (this.hasCoords(coords) && coords !== kingSrcCoords)
          return false;

    return true;
  }


  public override clone() {
    const clone = new Board();
    this.pieces.forEach((piece, coords) => clone.setByCoords(coords, piece));
    return clone;
  }
}