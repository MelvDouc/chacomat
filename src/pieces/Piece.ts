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
  PieceInfo,
  PieceInitial
} from "@chacomat/types.js";

export default class Piece {
  public static readonly TYPES = PieceType;
  public static readonly START_RANKS = startRanks;
  public static readonly MIDDLE_RANKS = middleRanks;
  public static readonly CASTLED_FILES = castledFiles;
  public static readonly DIRECTIONS = directions;
  private static readonly blackInitials: Record<PieceType, BlackPieceInitial> = {
    [PieceType.PAWN]: "p",
    [PieceType.KNIGHT]: "n",
    [PieceType.BISHOP]: "b",
    [PieceType.ROOK]: "r",
    [PieceType.QUEEN]: "q",
    [PieceType.KING]: "k"
  };

  public static fromInitial(initial: PieceInitial, board?: Board): Piece {
    const type = initial.toUpperCase() as PieceType;

    return new Piece({
      color: (initial === type) ? Color.WHITE : Color.BLACK,
      type,
      board: board as Board
    });
  }

  public static getWingRelativeToKing(kingY: number, compareY: number) {
    return getWing(kingY, compareY);
  }

  public static *castlingCoords(king: Piece, useChess960Rules: boolean) {
    yield* castlingCoords(king, useChess960Rules);
  }

  public static isRookOnInitialSquare({ coords: { x, y }, color }: Piece, castlingRights: CastlingRights): boolean {
    return x === startRanks.PIECE[color]
      && castlingRights[color].includes(y);
  }

  /**
   * Determine what color complex a bishop belongs to.
   * @returns Whether a bishop is on a light square (0) or a dark square (1)
   */
  public static getBishopSquareParity(bishop: Piece | null | undefined): 0 | 1 | typeof NaN {
    if (!bishop)
      return NaN;
    return (bishop.coords.x % 2 === bishop.coords.y % 2)
      ? 0
      : 1;
  }

  public readonly color: Color;
  public type: PieceType;
  public board: Board;
  public coords: Coords;

  constructor({ color, board, type, coords }: PieceInfo) {
    this.color = color;
    this.type = type;
    board && (this.board = board);
    coords && (this.coords = coords);
  }

  public get initial(): PieceInitial {
    return (this.color === Color.WHITE)
      ? this.type
      : Piece.blackInitials[this.type];
  }

  public get oppositeColor(): Color {
    return ReversedColor[this.color];
  }

  public *attackedCoords(): CoordsGenerator {
    yield* attackedCoordsGenerators[this.type](this);
  }

  public *pseudoLegalMoves(): CoordsGenerator {
    if (this.type === PieceType.PAWN) {
      yield* pseudoLegalPawnMoves(this);
      return;
    }

    for (const targetCoords of this.attackedCoords())
      if (this.board.get(targetCoords)?.color !== this.color)
        yield targetCoords;
  }

  public clone(): Piece {
    return new Piece({
      color: this.color,
      type: this.type,
      board: this.board,
      coords: this.coords
    });
  }

  public isKing(): boolean {
    return this.type === PieceType.KING;
  }

  public isRook(): boolean {
    return this.type === PieceType.ROOK;
  }

  public isBishop(): boolean {
    return this.type === PieceType.BISHOP;
  }

  public isQueen(): boolean {
    return this.type === PieceType.QUEEN;
  }

  public isKnight(): boolean {
    return this.type === PieceType.KNIGHT;
  }

  public isPawn(): boolean {
    return this.type === PieceType.PAWN;
  }
}