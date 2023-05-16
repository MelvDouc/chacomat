import Colors from "@src/constants/Colors.js";
import { Coordinates, File, getCoords } from "@src/constants/Coords.js";
import Position from "@src/game/Position.js";
import { CastlingRights, HalfMove } from "@src/types.js";

export default class Chess690Position extends Position {
  protected static override stringifyCastlingRights(castlingRights: CastlingRights): string {
    let castlingStr = "";

    castlingRights[Colors.WHITE].forEach((y) => castlingStr += File[y].toUpperCase());
    castlingRights[Colors.BLACK].forEach((y) => castlingStr += File[y]);

    return castlingStr || "-";
  }

  protected override getCastlingMove(kingCoords: Coordinates, rookY: number): HalfMove {
    return [
      kingCoords,
      getCoords(kingCoords.x, rookY)
    ];
  }
}