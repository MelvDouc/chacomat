import Color from "$src/constants/Color.js";
import { BOARD_WIDTH } from "$src/constants/dimensions.js";
import type RealMove from "$src/moves/RealMove.js";
import { JSONCastlingRights, Wing } from "$src/typings/types.js";

export default class CastlingRights {
  public static getWing(file: number): Wing {
    return file < BOARD_WIDTH / 2 ? "queenSide" : "kingSide";
  }

  public static fromString(castlingString: string): CastlingRights {
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

  public update({ srcPiece, srcPoint, destPoint, destPiece }: RealMove): void {
    if (destPiece?.isRook() && destPoint.y === destPiece.color.initialPieceRank) {
      const rights = destPiece.color.isWhite() ? this.white : this.black;
      rights[CastlingRights.getWing(destPoint.x)] = false;
    }

    const rights = srcPiece.color.isWhite() ? this.white : this.black;

    if (srcPiece.isKing()) {
      rights.queenSide = false;
      rights.kingSide = false;
      return;
    }

    if (srcPiece.isRook() && srcPoint.y === srcPiece.color.initialPieceRank) {
      rights[CastlingRights.getWing(srcPoint.x)] = false;
    }
  }

  public clone(): CastlingRights {
    const clone = new CastlingRights();
    Object.assign(clone.white, this.white);
    Object.assign(clone.black, this.black);
    return clone;
  }

  public toString(): string {
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