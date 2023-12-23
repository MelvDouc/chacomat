import Color from "$src/constants/Color.js";
import SquareIndex from "$src/constants/SquareIndex.js";
import Board from "$src/game/Board.js";
import { JSONPiece, PieceInitial, PieceOffsets } from "$src/typings/types.js";

export default abstract class Piece {
  public static readonly byInitial: Map<PieceInitial, Piece> = new Map();
  protected static readonly _byValue: Record<number, Piece> = {};

  protected abstract get _offsets(): PieceOffsets;

  constructor(
    readonly value: number,
    readonly color: Color,
    readonly initial: PieceInitial
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
  }): SquareIndex[] {
    return this.getAttacks(srcIndex, board).filter((destIndex) => {
      return board.get(destIndex)?.color !== this.color;
    });
  }

  public isPawn(): boolean { return false; }

  public isKnight(): boolean { return false; }

  public isBishop(): boolean { return false; }

  public isRook(): boolean { return false; }

  public isQueen(): boolean { return false; }

  public isKing(): boolean { return false; }

  public toJSON(): JSONPiece {
    return {
      initial: this.initial,
      color: this.color.name
    };
  }
}