import {
  Color,
  WhitePieceInitial,
  Wing
} from "@chacomat/utils/constants.js";
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
  Wings
} from "@chacomat/types.js";

export default abstract class Piece {
  public static readonly WHITE_PIECE_INITIALS = WhitePieceInitial;
  public static readonly WHITE_INITIAL: WhitePieceInitial;
  protected static readonly OFFSETS: { x: number[]; y: number[]; };
  public static readonly constructors: Map<WhitePieceInitial, typeof Piece> = new Map();

  public static readonly CASTLED_KING_FILES: Wings<number> = {
    [Wing.QUEEN_SIDE]: 2,
    [Wing.KING_SIDE]: 6
  };

  public static readonly CASTLED_ROOK_FILES: Wings<number> = {
    [Wing.QUEEN_SIDE]: 3,
    [Wing.KING_SIDE]: 5
  };

  public static readonly DIRECTIONS: BlackAndWhite<number> = {
    [Color.WHITE]: -1,
    [Color.BLACK]: 1
  };

  public static readonly START_PIECE_RANKS: BlackAndWhite<number> = {
    [Color.WHITE]: 7,
    [Color.BLACK]: 0
  };

  public static readonly START_PAWN_RANKS: BlackAndWhite<number> = {
    [Color.WHITE]: 6,
    [Color.BLACK]: 1
  };

  public static readonly MIDDLE_RANKS: BlackAndWhite<number> = {
    [Color.WHITE]: 4,
    [Color.BLACK]: 3
  };

  public static fromInitial(initial: PieceInitial, board?: Board): Piece {
    const whiteInitial = initial.toUpperCase() as WhitePieceInitial;
    return Reflect.construct(
      this.constructors.get(whiteInitial)!,
      [{
        color: (initial === whiteInitial) ? Color.WHITE : Color.BLACK,
        board
      } as PieceInfo]
    );
  }

  public readonly color: Color;
  public board: Board;
  public coords: Coords;

  constructor({ color, board, coords }: PieceInfo) {
    this.color = color;
    board && (this.board = board);
    coords && (this.coords = coords);
  }

  public get whiteInitial(): WhitePieceInitial {
    return (this.constructor as typeof Piece).WHITE_INITIAL;
  }

  public get initial(): PieceInitial {
    return (this.color === Color.WHITE)
      ? (this.constructor as typeof Piece).WHITE_INITIAL
      : (this.constructor as typeof Piece).WHITE_INITIAL.toLowerCase() as BlackPieceInitial;
  }

  public get oppositeColor(): Color {
    return (this.color === Color.WHITE) ? Color.BLACK : Color.WHITE;
  }

  public *attackedCoords(): CoordsGenerator {
    for (let i = 0; i < (this.constructor as typeof Piece).OFFSETS.x.length; i++) {
      const destCoords = this.coords.getPeer(
        (this.constructor as typeof Piece).OFFSETS.x[i],
        (this.constructor as typeof Piece).OFFSETS.y[i]
      );
      if (destCoords)
        yield destCoords;
    }
  }

  public *pseudoLegalMoves(): CoordsGenerator {
    for (const targetCoords of this.attackedCoords())
      if (this.board.get(targetCoords)?.color !== this.color)
        yield targetCoords;
  }

  public clone(): Piece {
    return Reflect.construct(this.constructor as typeof Piece, [{
      color: this.color,
      board: this.board,
      coords: this.coords
    } as PieceInfo]);
  }

  public isKing(): this is King {
    return this.whiteInitial === WhitePieceInitial.KING;
  }

  public isRook(): this is Rook {
    return this.whiteInitial === WhitePieceInitial.ROOK;
  }

  public isBishop(): this is Bishop {
    return this.whiteInitial === WhitePieceInitial.BISHOP;
  }

  public isKnight(): this is Bishop {
    return this.whiteInitial === WhitePieceInitial.KNIGHT;
  }

  public isPawn(): this is Pawn {
    return this.whiteInitial === WhitePieceInitial.PAWN;
  }
}