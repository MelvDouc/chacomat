import { castlingCoords, getWing } from "@chacomat/pieces/castling.js";
import {
  attackedCoordsGenerators,
  pseudoLegalPawnMoves
} from "@chacomat/pieces/piece-moves.js";
import {
  castledFiles,
  directions,
  middleRanks,
  startRanks
} from "@chacomat/pieces/placements.js";
import Color, { ReversedColor } from "@chacomat/utils/Color.js";
import { PieceType } from "@chacomat/utils/constants.js";
import type {
  BlackPieceInitial,
  Board,
  CastlingRights,
  Coords,
  CoordsGenerator,
  PieceParameters,
  PieceInitial
} from "@chacomat/types.js";

export default class Piece {
  static readonly TYPES = PieceType;
  static readonly START_RANKS = startRanks;
  static readonly MIDDLE_RANKS = middleRanks;
  static readonly CASTLED_FILES = castledFiles;
  static readonly DIRECTIONS = directions;
  static readonly #blackInitials: Record<PieceType, BlackPieceInitial> = {
    [PieceType.PAWN]: "p",
    [PieceType.KNIGHT]: "n",
    [PieceType.BISHOP]: "b",
    [PieceType.ROOK]: "r",
    [PieceType.QUEEN]: "q",
    [PieceType.KING]: "k"
  };

  static fromInitial(initial: PieceInitial): Piece {
    const type = initial.toUpperCase() as PieceType;

    return new Piece({
      color: (initial === type) ? Color.WHITE : Color.BLACK,
      type
    });
  }

  static getWingRelativeToKing(kingY: number, compareY: number) {
    return getWing(kingY, compareY);
  }

  static *castlingCoords(king: Piece, useChess960Rules: boolean) {
    yield* castlingCoords(king, useChess960Rules);
  }

  static isRookOnInitialSquare({ coords: { x, y }, color }: Piece, castlingRights: CastlingRights): boolean {
    return x === startRanks.PIECE[color] && castlingRights[color].includes(y);
  }

  /**
   * Determine what color complex a bishop belongs to.
   * @returns Whether a bishop is on a light square (0) or a dark square (1)
   */
  static getBishopSquareParity(bishop: Piece | null | undefined): 0 | 1 | typeof NaN {
    if (!bishop)
      return NaN;
    return (bishop.coords.x % 2 === bishop.coords.y % 2)
      ? 0
      : 1;
  }

  readonly color: Color;
  type: PieceType;
  board: Board;
  coords: Coords;

  constructor({ color, board, type, coords }: PieceParameters) {
    this.color = color;
    this.type = type;
    board && (this.board = board);
    coords && (this.coords = coords);
  }

  get initial(): PieceInitial {
    return (this.color === Color.WHITE)
      ? this.type
      : Piece.#blackInitials[this.type];
  }

  get oppositeColor(): Color {
    return ReversedColor[this.color];
  }

  *attackedCoords(): CoordsGenerator {
    yield* attackedCoordsGenerators[this.type](this);
  }

  *pseudoLegalMoves(): CoordsGenerator {
    if (this.type === PieceType.PAWN) {
      yield* pseudoLegalPawnMoves(this);
      return;
    }

    for (const targetCoords of this.attackedCoords())
      if (this.board.get(targetCoords)?.color !== this.color)
        yield targetCoords;
  }

  isKing(): boolean {
    return this.type === PieceType.KING;
  }

  isRook(): boolean {
    return this.type === PieceType.ROOK;
  }

  isBishop(): boolean {
    return this.type === PieceType.BISHOP;
  }

  isQueen(): boolean {
    return this.type === PieceType.QUEEN;
  }

  isKnight(): boolean {
    return this.type === PieceType.KNIGHT;
  }

  isPawn(): boolean {
    return this.type === PieceType.PAWN;
  }
}