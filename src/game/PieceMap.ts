import { Coordinates } from "@src/constants/Coords.js";
import Piece from "@src/constants/Piece.js";

export default class PieceMap extends Map<Coordinates, Piece> {
  public kingCoords: Coordinates;

  public override set(key: Coordinates, value: Piece): this {
    if (value === Piece.KING)
      this.kingCoords = key;

    return super.set(key, value);
  }

  public clone(): PieceMap {
    const clone = new PieceMap([...this]);
    clone.kingCoords = this.kingCoords;
    return this;
  }
}