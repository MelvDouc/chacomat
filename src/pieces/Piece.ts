import type Color from "$src/constants/Color.js";
import SquareIndex from "$src/constants/SquareIndex.js";
import type Board from "$src/game/Board.js";
import type Position from "$src/game/Position.js";
import PieceMove from "$src/moves/PieceMove.js";
import type RealMove from "$src/moves/RealMove.js";
import type { JSONPiece, PieceInitial, PieceOffsets } from "$src/typings/types.js";

export default abstract class Piece {
  public static readonly byInitial: Map<PieceInitial, Piece> = new Map();
  protected static readonly _byValue: Record<number, Piece> = {};

  protected abstract get _offsets(): PieceOffsets;

  public constructor(
    public readonly value: number,
    public readonly color: Color,
    public readonly initial: PieceInitial
  ) {
    Piece.byInitial.set(initial, this);
    Piece._byValue[value] = this;
  }

  public get opposite(): Piece {
    return Piece._byValue[-this.value];
  }

  public abstract getAttacks(srcIndex: SquareIndex, board: Board): SquareIndex[];

  public getPseudoLegalDestIndices({ srcIndex, board }: {
    srcIndex: SquareIndex;
    board: Board;
    enPassantIndex: SquareIndex | null;
  }) {
    return this.getAttacks(srcIndex, board).filter((destIndex) => {
      return board.get(destIndex)?.color !== this.color;
    });
  }

  public getMoveTo({ destIndex, position, srcFile, srcRank }: {
    destIndex: SquareIndex;
    srcFile: string | undefined;
    srcRank: string | undefined;
    position: Position;
  }): RealMove | null {
    for (const attack of this.getAttacks(destIndex, position.board)) {
      if (
        position.board.get(attack) === this
        && (!srcFile || SquareIndex[attack][0] === srcFile)
        && (!srcRank || SquareIndex[attack][1] === srcRank)
      )
        return new PieceMove({
          srcIndex: attack,
          destIndex,
          srcPiece: this,
          destPiece: position.board.get(destIndex)
        });
    }

    return null;
  }

  public isPawn() { return false; }

  public isKnight() { return false; }

  public isBishop() { return false; }

  public isRook() { return false; }

  public isQueen() { return false; }

  public isKing() { return false; }

  public toJSON(): JSONPiece {
    return {
      initial: this.initial,
      color: this.color.name
    };
  }
}