import Colors from "@src/constants/Colors.js";
import { fileNameToY, getCoords, yToFileName } from "@src/constants/Coords.js";
import Piece from "@src/constants/Piece.js";
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
          ? castlingRights[Colors.WHITE].add(fileNameToY(char.toLowerCase()))
          : castlingRights[Colors.BLACK].add(fileNameToY(char));
      }
    }

    return castlingRights;
  }

  protected static override stringifyCastlingRights(castlingRights: CastlingRights): string {
    let castlingStr = "";

    castlingRights[Colors.WHITE].forEach((y) => castlingStr += yToFileName(y).toUpperCase());
    castlingRights[Colors.BLACK].forEach((y) => castlingStr += yToFileName(y));

    return castlingStr || "-";
  }

  protected override getCastlingMove(kingCoords: Coordinates, rookY: number): HalfMove {
    return [
      kingCoords,
      getCoords(kingCoords.x, rookY)
    ];
  }

  public override isCastlingMove(srcCoords: Coordinates, destCoords: Coordinates): boolean {
    return this.board.get(this.activeColor, srcCoords) === Piece.KING
      && this.board.get(this.activeColor, destCoords) === Piece.ROOK;
  }
}