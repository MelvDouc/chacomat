import { ReversedColor } from "@chacomat/constants/Color.js";
import type {
  BlackPieceInitial,
  Board,
  Color,
  Coords,
  IndexGenerator,
  PieceInitial,
  PieceOffsets,
  WhitePieceInitial,
  Wings
} from "@chacomat/types.local.js";
import { coordsToIndex, indexToCoords, isSafe } from "@chacomat/utils/Index.js";

export default abstract class Piece {
  static readonly whiteInitial: WhitePieceInitial;
  static readonly offsets: PieceOffsets;
  static readonly START_RANKS = {
    WHITE: 6,
    BLACK: 1
  };
  static readonly CASTLED_KING_FILES: Wings<number> = {
    0: 2,
    7: 6
  };
  static readonly CASTLED_ROOK_FILES: Wings<number> = {
    0: 3,
    7: 5
  };
  static readonly DIRECTIONS = {
    WHITE: -1,
    BLACK: 1
  };

  readonly color: Color;
  #index: number;
  #board: Board;

  constructor(color: Color) {
    this.color = color;
  }

  get pieceType(): typeof Piece {
    return this.constructor as typeof Piece;
  }

  get initial(): PieceInitial {
    const initial = this.pieceType.whiteInitial;
    return (this.color === "WHITE")
      ? initial
      : initial.toLowerCase() as BlackPieceInitial;
  }

  get pieceName(): string {
    return this.pieceType.name;
  }

  get direction(): number {
    return this.pieceType.DIRECTIONS[this.color];
  }

  get offsets() {
    return this.pieceType.offsets;
  }

  get startRank(): number {
    return this.pieceType.START_RANKS[this.color];
  }

  get oppositeColor(): Color {
    return ReversedColor[this.color];
  }

  getIndex(): number {
    return this.#index;
  }

  setIndex(index: number): this {
    this.#index = index;
    return this;
  }

  getCoords(): Coords {
    return indexToCoords(this.#index);
  }

  setCoords(coords: Coords): this {
    this.#index = coordsToIndex(coords.x, coords.y);
    return this;
  }

  getBoard(): Board {
    return this.#board;
  }

  setBoard(board: Board): this {
    this.#board = board;
    return this;
  }

  *attackedIndices(): IndexGenerator {
    const { x, y } = this.getCoords();
    const multiplier = this.pieceName === "Pawn" ? this.direction : 1;

    for (let i = 0; i < this.offsets.x.length; i++) {
      const x2 = x + this.offsets.x[i] * multiplier,
        y2 = y + this.offsets.y[i];
      if (isSafe(x2) && isSafe(y2))
        yield coordsToIndex(x2, y2);
    }
  }

  *pseudoLegalMoves(): IndexGenerator {
    for (const targetIndex of this.attackedIndices())
      if (this.#board.get(targetIndex)?.color !== this.color)
        yield targetIndex;
  }

  clone(): Piece {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new (this as any)(this.color);
  }
}