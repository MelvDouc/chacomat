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
  public static readonly Types = PieceType;
  public static readonly castlingCoords = castlingCoords;
  private static readonly slidingTypes = [
    PieceType.ROOK,
    PieceType.BISHOP,
    PieceType.QUEEN,
  ];

  public static readonly INITIAL_PIECE_RANKS: BlackAndWhite<ChessRank> = {
    [Color.WHITE]: 7,
    [Color.BLACK]: 0,
  };

  public static readonly CASTLED_ROOK_FILES = {
    [Wing.QUEEN_SIDE]: 3,
    [Wing.KING_SIDE]: 5,
  };

  public static readonly MIDDLE_RANKS: BlackAndWhite<ChessRank> = {
    [Color.WHITE]: 4,
    [Color.BLACK]: 3,
  };

  public static fromInitial(initial: PieceInitial) {
    const initialKey = initial.toUpperCase() as WhitePieceInitial;
    return new Piece(
      (initialKey === initial) ? Color.WHITE : Color.BLACK,
      PieceByInitial[initialKey] as unknown as PieceType,
    );
  }

  public static promote(piece: Piece, newType: Promotable): Piece {
    piece.type = PieceByInitial[newType] as unknown as PieceType;
    return piece;
  }

  public readonly color: Color;
  public type: PieceType;

  constructor(color: Color, type: PieceType) {
    this.color = color;
    this.type = type;
  }

  public get initial(): PieceInitial {
    return (this.color === Color.WHITE)
      ? PieceByInitial[this.type] as WhitePieceInitial
      : (PieceByInitial[this.type] as WhitePieceInitial).toLowerCase() as BlackPieceInitial;
  }

  public get oppositeColor(): Color {
    return -this.color as Color;
  }

  public get oppositeMidRank(): ChessRank {
    return Piece.MIDDLE_RANKS[this.oppositeColor];
  }

  private get offsets(): { x: number[]; y: number[]; } {
    return offsets[this.color][this.type];
  }

  private *slidingAttackedCoords(srcCoords: Coords, board: Board): CoordsGenerator {
    for (let i = 0; i < this.offsets.x.length; i++) {
      let x = srcCoords.x + this.offsets.x[i],
        y = srcCoords.y + this.offsets.y[i];
      while (x >= 0 && x < 8 && y >= 0 && y < 8) {
        yield { x, y };
        if (board.get({ x, y })) break;
        x += this.offsets.x[i];
        y += this.offsets.y[i];
      }
    }
  }

  public *attackedCoords(srcCoords: Coords, board: Board): CoordsGenerator {
    if (Piece.slidingTypes.includes(this.type)) {
      yield* this.slidingAttackedCoords(srcCoords, board);
      return;
    }

    for (let i = 0; i < this.offsets.x.length; i++) {
      const x = srcCoords.x + this.offsets.x[i],
        y = srcCoords.y + this.offsets.y[i];
      if (x >= 0 && x < 8 && y >= 0 && y < 8)
        yield { x, y };
    }
  }

  public *pseudoLegalMoves(srcCoords: Coords, position: Position): CoordsGenerator {
    if (this.type === PieceType.PAWN) {
      yield* pseudoLegalPawnMoves(this, srcCoords, position);
      return;
    }

    for (const targetCoords of this.attackedCoords(srcCoords, position.board))
      if (position.board.get(targetCoords)?.color !== this.color)
        yield targetCoords;
  }

  public clone(): Piece {
    return new Piece(this.color, this.type);
  }
}