import Colors from "$src/constants/Colors.ts";
import { pieceRanks } from "$src/constants/Ranks.ts";
import { BOARD_WIDTH } from "$src/constants/dimensions.ts";
import { JSONCastlingRights, RealMove, Wing } from "$src/typings/types.ts";

export default class CastlingRights {
  public static getWing(file: number): Wing {
    return file < BOARD_WIDTH / 2 ? "queenSide" : "kingSide";
  }

  public static fromString(castlingString: string): CastlingRights {
    const castlingRights = new this();

    if (!castlingString.includes("K"))
      castlingRights.kingSide[Colors.WHITE] = false;
    if (!castlingString.includes("Q"))
      castlingRights.queenSide[Colors.WHITE] = false;
    if (!castlingString.includes("k"))
      castlingRights.kingSide[Colors.BLACK] = false;
    if (!castlingString.includes("q"))
      castlingRights.queenSide[Colors.BLACK] = false;

    return castlingRights;
  }

  public readonly queenSide = {
    [Colors.WHITE]: true,
    [Colors.BLACK]: true
  };
  public readonly kingSide = {
    [Colors.WHITE]: true,
    [Colors.BLACK]: true
  };

  public *[Symbol.iterator](): Generator<[Wing, JSONCastlingRights[Wing]]> {
    yield ["queenSide", this.queenSide];
    yield ["kingSide", this.kingSide];
  }

  public update({ srcPiece, srcPoint, destPoint, destPiece }: RealMove): void {
    if (destPiece?.isRook() && destPoint.y === pieceRanks[destPiece.color])
      this[CastlingRights.getWing(destPoint.x)][destPiece.color] = false;

    if (srcPiece.isKing()) {
      this.queenSide[srcPiece.color] = false;
      this.kingSide[srcPiece.color] = false;
      return;
    }

    if (srcPiece.isRook() && srcPoint.y === pieceRanks[srcPiece.color])
      this[CastlingRights.getWing(srcPoint.x)][srcPiece.color] = false;
  }

  public clone(): CastlingRights {
    const clone = new CastlingRights();
    Object.assign(clone.queenSide, this.queenSide);
    Object.assign(clone.kingSide, this.kingSide);
    return clone;
  }

  public toString(): string {
    let castlingString = "";

    if (this.kingSide[Colors.BLACK])
      castlingString += "k";
    if (this.queenSide[Colors.BLACK])
      castlingString += "q";
    if (this.kingSide[Colors.WHITE])
      castlingString += "K";
    if (this.queenSide[Colors.WHITE])
      castlingString += "Q";

    return castlingString || "-";
  }

  public toJSON(): JSONCastlingRights {
    return {
      queenSide: { ...this.queenSide },
      kingSide: { ...this.kingSide }
    };
  }
}