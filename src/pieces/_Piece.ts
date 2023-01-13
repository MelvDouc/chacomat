import { Color, Wing } from "../utils/constants.js";
import type {
  Bishop,
  BlackAndWhite,
  BlackPieceInitial,
  Board,
  Coords,
  CoordsGenerator,
  King,
  Knight,
  Pawn,
  PieceInfo,
  PieceInitial,
  Queen,
  Rook,
  WhitePieceInitial,
  Wings
} from "../types.js";

export default abstract class Piece {
  public static readonly constructors = new Map<WhitePieceInitial, typeof Piece>();
  public static readonly offsets: { x: number[]; y: number[]; };
  public static readonly whiteInitial: WhitePieceInitial;

  public static readonly directions: BlackAndWhite<number> = {
    [Color.WHITE]: -1,
    [Color.BLACK]: 1
  };

  public static readonly startPieceRanks: BlackAndWhite<number> = {
    [Color.WHITE]: 7,
    [Color.BLACK]: 0
  };

  public static readonly startPawnRanks: BlackAndWhite<number> = {
    [Color.WHITE]: 6,
    [Color.BLACK]: 1
  };

  public static readonly castledKingFiles: Wings<number> = {
    [Wing.QUEEN_SIDE]: 2,
    [Wing.KING_SIDE]: 6
  };

  public static readonly castledRookFiles: Wings<number> = {
    [Wing.QUEEN_SIDE]: 3,
    [Wing.KING_SIDE]: 5
  };

  public static readonly middleRanks: BlackAndWhite<number> = {
    [Color.WHITE]: 4,
    [Color.BLACK]: 3
  };

  public static fromInitial(initial: PieceInitial, board?: Board): Piece {
    const whiteInitial = initial.toUpperCase() as WhitePieceInitial;
    return Reflect.construct(
      this.constructors.get(whiteInitial)!,
      [{
        color: initial === whiteInitial ? Color.WHITE : Color.BLACK,
        board
      } as PieceInfo]
    );
  }

  public readonly color: Color;
  public readonly board: Board;
  public coords: Coords;

  constructor({ color, board, coords }: PieceInfo) {
    this.color = color;
    board && (this.board = board);
    coords && (this.coords = coords);
  }

  public get whiteInitial(): WhitePieceInitial {
    return (this.constructor as typeof Piece).whiteInitial;
  }

  public get initial(): PieceInitial {
    return (this.color === Color.WHITE)
      ? this.whiteInitial
      : this.whiteInitial.toLowerCase() as BlackPieceInitial;
  }

  public get oppositeColor(): Color {
    return (this.color === Color.WHITE) ? Color.BLACK : Color.WHITE;
  }

  public *attackedCoords(): CoordsGenerator {
    const { x: xOffsets, y: yOffsets } = (this.constructor as typeof Piece).offsets;

    for (let i = 0; i < xOffsets.length; i++) {
      const destCoords = this.coords.getPeer(xOffsets[i], yOffsets[i]);
      if (destCoords)
        yield destCoords;
    }
  }

  public *pseudoLegalMoves(): CoordsGenerator {
    for (const targetCoords of this.attackedCoords())
      if (this.board.get(targetCoords)?.color !== this.color)
        yield targetCoords;
  }

  public clone(board?: Board): Piece {
    return Reflect.construct(this.constructor as typeof Piece, [{
      color: this.color,
      board: board ?? this.board,
      coords: this.coords
    } as PieceInfo]);
  }

  public isKing(): this is King { return false; }
  public isQueen(): this is Queen { return false; }
  public isRook(): this is Rook { return false; }
  public isBishop(): this is Bishop { return false; }
  public isKnight(): this is Knight { return false; }
  public isPawn(): this is Pawn { return false; }
}