import Color from "../constants/Color.js";
import Wing from "../constants/Wing.js";
import type {
  BlackAndWhite,
  BlackPieceInitial,
  Board,
  Coords,
  CoordsGenerator,
  PieceInfo,
  PieceInitial,
  Position,
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

  public static fromInitial(initial: PieceInitial): Piece {
    const whiteInitial = initial.toUpperCase() as WhitePieceInitial;
    return Reflect.construct(
      this.constructors.get(whiteInitial)!,
      [{
        color: initial === whiteInitial ? Color.WHITE : Color.BLACK
      } as PieceInfo]
    );
  }

  public readonly color: Color;
  public coords: Coords;

  constructor({ color, coords }: PieceInfo) {
    this.color = color;
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

  public *attackedCoords(board: Board): CoordsGenerator {
    const { x: xOffsets, y: yOffsets } = (this.constructor as typeof Piece).offsets;

    for (let i = 0; i < xOffsets.length; i++) {
      const destCoords = this.coords.getPeer(xOffsets[i], yOffsets[i]);
      if (destCoords)
        yield destCoords;
    }
  }

  public *pseudoLegalMoves(position: Position): CoordsGenerator {
    for (const targetCoords of this.attackedCoords(position.board))
      if (position.board.get(targetCoords)?.color !== this.color)
        yield targetCoords;
  }

  public clone(): Piece {
    return Reflect.construct(this.constructor as typeof Piece, [{
      color: this.color,
      coords: this.coords
    } as PieceInfo]);
  }
}