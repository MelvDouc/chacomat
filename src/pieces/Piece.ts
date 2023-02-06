import { ReversedColor } from "@chacomat/constants/Color.js";
import { canCastleToFile, getWing } from "@chacomat/pieces/castling.js";
import {
  attackedIndexGenerators,
  pseudoLegalPawnMoves
} from "@chacomat/pieces/piece-moves.js";
import {
  castledFiles,
  directions,
  middleRanks,
  startRanks
} from "@chacomat/pieces/placements.js";
import type {
  BlackPieceInitial,
  Board,
  CastlingRights,
  Color,
  IndexGenerator,
  PieceInitial,
  PieceParameters,
  PieceType,
  WhitePieceInitial
} from "@chacomat/types.local.js";
import { coordsToIndex, indexToCoords } from "@chacomat/utils/Index.js";

export default class Piece {
  static readonly START_RANKS = startRanks;
  static readonly MIDDLE_RANKS = middleRanks;
  static readonly CASTLED_FILES = castledFiles;
  static readonly DIRECTIONS = directions;
  static readonly INITIALS: {
    WHITE: Record<PieceType, WhitePieceInitial>;
    BLACK: Record<PieceType, BlackPieceInitial>;
  } = {
      WHITE: {
        P: "P", N: "N", B: "B", R: "R", Q: "Q", K: "K"
      },
      BLACK: {
        P: "p", N: "n", B: "b", R: "r", Q: "q", K: "k"
      }
    };

  static fromInitial(initial: PieceInitial): Piece {
    const type = initial.toUpperCase() as PieceType;

    return new Piece({
      color: (initial === type) ? "WHITE" : "BLACK",
      type
    });
  }

  static getWingRelativeToKing(kingY: number, compareY: number) {
    return getWing(kingY, compareY);
  }

  static *castlingCoords(king: Piece, useChess960Rules: boolean): IndexGenerator {
    const coords = king.coords;

    for (const srcRookY of king.board.position.castlingRights[king.color])
      if (canCastleToFile(king, srcRookY))
        // Yield an empty file in regular chess and the castling rook's file in Chess960.
        yield (useChess960Rules)
          ? coordsToIndex(coords.x, srcRookY)
          : coordsToIndex(coords.x, castledFiles.KING[getWing(coords.y, srcRookY)]);
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
    const { x, y } = indexToCoords(bishop.index);
    return (x % 2 === y % 2) ? 0 : 1;
  }

  readonly color: Color;
  type: PieceType;
  board: Board;
  index: number;

  constructor({ color, board, type, index }: PieceParameters) {
    this.color = color;
    this.type = type;
    board && (this.board = board);
    index !== undefined && (this.index = index);
  }

  get coords(): { x: number; y: number; } {
    return indexToCoords(this.index);
  }

  get initial(): PieceInitial {
    return Piece.INITIALS[this.color][this.type];
  }

  get oppositeColor(): Color {
    return ReversedColor[this.color];
  }

  get direction(): number {
    return directions[this.color];
  }

  get startRank(): number {
    if (this.type === "P")
      return startRanks.PAWN[this.color];
    return startRanks.PIECE[this.color];
  }

  *attackedIndices(): IndexGenerator {
    yield* attackedIndexGenerators[this.type](this);
  }

  *pseudoLegalMoves(): IndexGenerator {
    if (this.type === "P") {
      yield* pseudoLegalPawnMoves(this);
      return;
    }

    for (const targetIndex of this.attackedIndices())
      if (this.board.get(targetIndex)?.color !== this.color)
        yield targetIndex;
  }

  isKing(): boolean {
    return this.type === "K";
  }

  isRook(): boolean {
    return this.type === "R";
  }

  isBishop(): boolean {
    return this.type === "B";
  }

  isQueen(): boolean {
    return this.type === "Q";
  }

  isKnight(): boolean {
    return this.type === "N";
  }

  isPawn(): boolean {
    return this.type === "P";
  }
}