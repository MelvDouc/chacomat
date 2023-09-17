import BaseBoard from "@/base/BaseBoard.ts";
import type Coords from "@/base/Coords.ts";
import Color from "@/constants/Color.ts";
import Piece from "@/standard/Piece.ts";

export default class Board extends BaseBoard<Piece> {
  public readonly castlingMultiplier: number = 2;

  public get PieceConstructor() {
    return Piece;
  }

  public getCastledKingCoords(color: Color, rookSrcY: number) {
    const { x, y } = this.getKingCoords(color);
    return this.Coords.get(
      x,
      this.width / 2 + this.castlingMultiplier * Math.sign(rookSrcY - y)
    );
  }

  public canCastle(rookSrcY: number, color: Color, attackedCoords: Set<Coords>): boolean {
    const kingSrcCoords = this.getKingCoords(color),
      rookSrcCoords = this.Coords.get(kingSrcCoords.x, rookSrcY),
      direction = Math.sign(rookSrcY - kingSrcCoords.y),
      rookDestCoords = this.getCastledKingCoords(color, rookSrcY).peer(0, -direction)!,
      rookMoveCount = Math.abs(rookDestCoords.y - rookSrcY);

    for (let i = 1; i <= this.castlingMultiplier; i++) {
      const coords = kingSrcCoords.peer(0, i * direction)!;
      if (this.has(coords) || attackedCoords.has(coords))
        return false;
    }

    for (let i = 1; i <= rookMoveCount; i++)
      if (this.has(rookSrcCoords.peer(0, -i * direction)!))
        return false;

    return true;
  }
}