import globalConfig from "@/global-config.ts";
import { ChacoMat } from "@/typings/chacomat.ts";

export default abstract class Move {
  constructor(
    readonly srcCoords: ChacoMat.Coords,
    readonly destCoords: ChacoMat.Coords,
    readonly srcPiece: ChacoMat.Piece,
    readonly capturedPiece: ChacoMat.Piece | null = null
  ) { }

  abstract play(board: ChacoMat.Board): void;
  abstract undo(board: ChacoMat.Board): void;
  abstract algebraicNotation(position: ChacoMat.Position): string;

  fullAlgebraicNotation(positionBefore: ChacoMat.Position, positionAfter: ChacoMat.Position) {
    return this.algebraicNotation(positionBefore) + this.getCheckSign(positionAfter);
  }

  computerNotation() {
    return this.srcCoords.notation + this.destCoords.notation;
  }

  getCheckSign(nextPosition: ChacoMat.Position) {
    if (nextPosition.isCheckmate())
      return globalConfig.useDoublePlusForCheckmate ? "++" : "#";
    if (nextPosition.isCheck())
      return "+";
    return "";
  }

  toJSON(position: ChacoMat.Position): ChacoMat.JSONMove {
    return {
      srcCoords: this.srcCoords.toJSON(),
      destCoords: this.destCoords.toJSON(),
      algebraicNotation: this.algebraicNotation(position)
    };
  }
}