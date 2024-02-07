import type Color from "$src/game/Color.js";
import { BOARD_LENGTH } from "$src/game/constants.js";
import type Point from "$src/game/Point.js";
import type Piece from "$src/pieces/Piece.js";
import type { JSONCastlingRights, Wing } from "$src/types.js";

export default class CastlingRights {
  public static getWing(file: number): Wing {
    return file < BOARD_LENGTH / 2 ? "queenSide" : "kingSide";
  }

  public static fromString(castlingString: string) {
    const castlingRights = new this();

    if (!castlingString.includes("K"))
      castlingRights.white.kingSide = false;
    if (!castlingString.includes("Q"))
      castlingRights.white.queenSide = false;
    if (!castlingString.includes("k"))
      castlingRights.black.kingSide = false;
    if (!castlingString.includes("q"))
      castlingRights.black.queenSide = false;

    return castlingRights;
  }

  public readonly white = {
    kingSide: true,
    queenSide: true
  };
  public readonly black = {
    kingSide: true,
    queenSide: true
  };

  public get(color: Color) {
    return color.isWhite() ? this.white : this.black;
  }

  public update(srcPiece: Piece, capturedPiece: Piece | null, srcPoint: Point, destPoint: Point) {
    if (capturedPiece?.isRook() && destPoint.y === capturedPiece.color.initialPieceRank) {
      this.get(capturedPiece.color)[CastlingRights.getWing(destPoint.x)] = false;
    }

    const rights = this.get(srcPiece.color);

    if (srcPiece.isKing()) {
      rights.queenSide = false;
      rights.kingSide = false;
      return;
    }

    if (srcPiece.isRook() && srcPoint.y === srcPiece.color.initialPieceRank) {
      rights[CastlingRights.getWing(srcPoint.x)] = false;
    }
  }

  public clone() {
    const clone = new CastlingRights();
    Object.assign(clone.white, this.white);
    Object.assign(clone.black, this.black);
    return clone;
  }

  public toString() {
    let castlingString = "";

    if (this.black.kingSide)
      castlingString += "k";
    if (this.black.queenSide)
      castlingString += "q";
    if (this.white.kingSide)
      castlingString += "K";
    if (this.white.queenSide)
      castlingString += "Q";

    return castlingString || "-";
  }

  public toJSON(): JSONCastlingRights {
    return {
      white: { ...this.white },
      black: { ...this.black }
    };
  }
}