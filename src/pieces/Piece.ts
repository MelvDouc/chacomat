import type Board from "$src/game/Board.js";
import type Color from "$src/game/Color.js";
import { SquareIndex } from "$src/game/constants.js";
import type { JSONPiece, PieceInitial, PieceOffsets } from "$src/types.js";

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