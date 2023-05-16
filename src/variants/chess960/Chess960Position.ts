import { Coordinates, getCoords } from "@src/constants/Coords.js";
import Position from "@src/game/Position.js";
import { stringifyChess960CastlingRights } from "@src/pgn-fen/fen.js";
import { HalfMove } from "@src/types.js";

export default class Chess690Position extends Position {
  protected override get castlingStr(): string {
    return stringifyChess960CastlingRights(this.castlingRights);
  }

  protected override getCastlingMove(kingCoords: Coordinates, rookY: number): HalfMove {
    return [
      kingCoords,
      getCoords(kingCoords.x, rookY)
    ];
  }
}