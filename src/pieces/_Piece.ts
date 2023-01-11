import Color from "../constants/Color.js";
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
  WhitePieceInitial,
} from "../types.js";

abstract class Piece {
  public static readonly INITIAL_PIECE_RANKS: BlackAndWhite<ChessRank> = {
    [Color.WHITE]: 7,
    [Color.BLACK]: 0,
  };

  public static readonly initialPawnRanks = {
    [Color.WHITE]: 6,
    [Color.BLACK]: 1
  };

  public static readonly CASTLED_ROOK_FILES = {
    [Wing.QUEEN_SIDE]: 3,
    [Wing.KING_SIDE]: 5,
  };

  public static readonly MIDDLE_RANKS: BlackAndWhite<ChessRank> = {
    [Color.WHITE]: 4,
    [Color.BLACK]: 3,
  };

  public static readonly offsets: { x: number[]; y: number[]; };
  public static readonly initial: WhitePieceInitial;
  public static readonly constructors = new Map<WhitePieceInitial, typeof Piece>();

  public static fromInitial(initial: PieceInitial): Piece {
    return Reflect.construct(
      this.constructors.get(initial.toUpperCase() as WhitePieceInitial)!,
      [initial === initial.toUpperCase() ? Color.WHITE : Color.BLACK]
    );
  }

  public readonly color: Color;

  constructor(color: Color) {
    this.color = color;
  }

  public get whiteInitial(): WhitePieceInitial {
    return (this.constructor as typeof Piece).initial;
  }

  public get initial(): PieceInitial {
    return (this.color === Color.WHITE)
      ? this.whiteInitial
      : this.whiteInitial.toLowerCase() as BlackPieceInitial;
  }

  public get oppositeColor(): Color {
    return -this.color as Color;
  }

  public *attackedCoords(srcCoords: Coords, board: Board): CoordsGenerator {
    const { x: xOffsets, y: yOffsets } = (this.constructor as typeof Piece).offsets;

    for (let i = 0; i < xOffsets.length; i++) {
      const x = srcCoords.x + xOffsets[i],
        y = srcCoords.y + yOffsets[i];
      if (x >= 0 && x < 8 && y >= 0 && y < 8)
        yield { x, y };
    }
  }

  public *pseudoLegalMoves(srcCoords: Coords, position: Position): CoordsGenerator {
    for (const targetCoords of this.attackedCoords(srcCoords, position.board))
      if (position.board.get(targetCoords)?.color !== this.color)
        yield targetCoords;
  }

  public clone(): Piece {
    return Reflect.construct(this.constructor, [this.color]);
  }
}

export default Piece;