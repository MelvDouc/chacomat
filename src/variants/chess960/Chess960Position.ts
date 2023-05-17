import Colors from "@src/constants/Colors.js";
import { File, getCoords } from "@src/constants/Coords.js";
import Position from "@src/game/Position.js";
import { CastlingRights, Coordinates, HalfMove } from "@src/types.js";


export default class Chess690Position extends Position {
  protected static override parseCastlingRights(castlingStr: string): CastlingRights {
    const castlingRights: CastlingRights = {
      [Colors.WHITE]: new Set(),
      [Colors.BLACK]: new Set()
    };

    if (castlingStr !== "-") {
      for (const char of castlingStr) {
        (char !== char.toLowerCase())
          ? castlingRights[Colors.WHITE].add(File[char.toLowerCase() as keyof typeof File])
          : castlingRights[Colors.BLACK].add(File[char as keyof typeof File]);
      }
    }

    return castlingRights;
  }

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