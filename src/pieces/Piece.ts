import Colors from "$src/constants/Colors.ts";
import { Board, Color, PieceInitial, SquareIndex } from "$src/typings/types.ts";

export default abstract class Piece {
  static readonly byInitial = new Map<PieceInitial, Piece>();

  protected static readonly _byValue: Record<number, Piece> = {};

  protected abstract get _offsets(): {
    x: number[];
    y: number[];
  };

  constructor(
    readonly value: number,
    readonly color: Color,
    readonly initial: PieceInitial
  ) {
    Piece.byInitial.set(initial, this);
    Piece._byValue[value] = this;
  }

  get opposite() {
    return Piece._byValue[-this.value];
  }

  abstract getAttacks(srcIndex: SquareIndex, board: Board): SquareIndex[];

  getPseudoLegalDestIndices({ srcIndex, board }: {
    srcIndex: SquareIndex;
    board: Board;
    enPassantIndex: SquareIndex | null;
  }) {
    return this.getAttacks(srcIndex, board).filter((destIndex) => {
      return board.get(destIndex)?.color !== this.color;
    });
  }

  isPawn() { return false; }

  isKnight() { return false; }

  isBishop() { return false; }

  isRook() { return false; }

  isQueen() { return false; }

  isKing() { return false; }

  toJSON() {
    return {
      initial: this.initial,
      color: Colors[this.color]
    };
  }
}