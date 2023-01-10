import Color from "../constants/Color.js";
import offsets from "../constants/offsets.js";
import PieceType, { PieceByInitial } from "../constants/PieceType.js";
import Wing from "../constants/Wing.js";
import type {
  BlackAndWhite,
  BlackPieceInitial,
  Board,
  ChessRank,
  Coords,
  CoordsGenerator,
  PieceInitial,
  Position,
  Promotable,
  WhitePieceInitial,
} from "../types.js";
import castlingCoords from "./castling.js";
import pseudoLegalPawnMoves from "./pawn-moves.js";

export default class Piece {
  static readonly Types = PieceType;

  static readonly INITIAL_PIECE_RANKS: BlackAndWhite<ChessRank> = {
    [Color.WHITE]: 7,
    [Color.BLACK]: 0,
  };

  static readonly CASTLED_ROOK_FILES = {
    [Wing.QUEEN_SIDE]: 3,
    [Wing.KING_SIDE]: 5,
  };

  static readonly MIDDLE_RANKS: BlackAndWhite<ChessRank> = {
    [Color.WHITE]: 4,
    [Color.BLACK]: 3,
  };

  static readonly castlingCoords = castlingCoords;

  static fromInitial(initial: PieceInitial) {
    const initialKey = initial.toUpperCase() as WhitePieceInitial;
    return new Piece(
      (initialKey === initial) ? Color.WHITE : Color.BLACK,
      PieceByInitial[initialKey] as unknown as PieceType,
    );
  }

  static promote(piece: Piece, newType: Promotable): Piece {
    piece.type = PieceByInitial[newType] as unknown as PieceType;
    return piece;
  }

  static #isSafe(x: number, y: number): boolean {
    return x >= 0 && x < 8 && y >= 0 && y < 8;
  }

  readonly color: Color;
  type: PieceType;

  constructor(color: Color, type: PieceType) {
    this.color = color;
    this.type = type;
  }

  get initial(): PieceInitial {
    return (this.color === Color.WHITE)
      ? PieceByInitial[this.type] as WhitePieceInitial
      : (PieceByInitial[this.type] as WhitePieceInitial)
        .toLowerCase() as BlackPieceInitial;
  }

  get oppositeColor(): Color {
    return -this.color as Color;
  }

  get oppositeMidRank(): ChessRank {
    return Piece.MIDDLE_RANKS[this.oppositeColor];
  }

  get #offsets(): { x: number[]; y: number[]; } {
    return offsets[this.color][this.type];
  }

  *#slidingAttackedCoords(
    srcCoords: Coords,
    board: Board,
  ): CoordsGenerator {
    for (let i = 0; i < this.#offsets.x.length; i++) {
      const coords = {
        x: srcCoords.x + this.#offsets.x[i],
        y: srcCoords.y + this.#offsets.y[i]
      };
      while (Piece.#isSafe(coords.x, coords.y)) {
        yield { ...coords };
        if (board.get(coords)) break;
        coords.x += this.#offsets.x[i];
        coords.y += this.#offsets.y[i];
      }
    }
  }

  *attackedCoords(srcCoords: Coords, board: Board): CoordsGenerator {
    if (
      this.type === PieceType.BISHOP || this.type === PieceType.ROOK ||
      this.type === PieceType.QUEEN
    ) {
      yield* this.#slidingAttackedCoords(srcCoords, board);
      return;
    }

    for (let i = 0; i < this.#offsets.x.length; i++) {
      const x = srcCoords.x + this.#offsets.x[i],
        y = srcCoords.y + this.#offsets.y[i];
      if (Piece.#isSafe(x, y)) {
        yield { x, y };
      }
    }
  }

  *pseudoLegalMoves(srcCoords: Coords, position: Position) {
    if (this.type === PieceType.PAWN) {
      yield* pseudoLegalPawnMoves(this, srcCoords, position);
      return;
    }

    for (const targetCoords of this.attackedCoords(srcCoords, position.board))
      if (position.board.get(targetCoords)?.color !== this.color)
        yield targetCoords;
  }

  clone(): Piece {
    return new Piece(this.color, this.type);
  }
}
