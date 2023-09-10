import { fileNameToY, yToFileName } from "@/base/CoordsUtils.ts";
import Color from "@/constants/Color.ts";
import CastlingRightsMap from "@/standard/CastlingRightsMap.ts";

export default class Chess960CastlingRightsMap extends CastlingRightsMap {
  public static fromString(castlingStr: string, boardHeight = 8, boardWidth = 8) {
    const castlingRights = new this([
      [Color.WHITE, new Set()],
      [Color.BLACK, new Set()]
    ]);

    for (const char of castlingStr) {
      if (char === char.toUpperCase())
        castlingRights.get(Color.WHITE)!.add(boardWidth * (boardHeight - 1) + fileNameToY(char.toLowerCase()));
      else
        castlingRights.get(Color.BLACK)!.add(fileNameToY(char));
    }

    return castlingRights;
  }

  public override toString(boardHeight = 8, boardWidth = 8) {
    let castlingStr = "";

    for (const file of this.get(Color.BLACK)!)
      castlingStr += yToFileName(file);
    for (const file of this.get(Color.WHITE)!)
      castlingStr += yToFileName(file - boardWidth * (boardHeight - 1)).toUpperCase();

    return castlingStr || "-";
  }
}