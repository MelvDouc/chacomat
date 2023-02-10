import { ReversedColor } from "@chacomat/constants/Color.js";
import type {
  Bishop,
  BlackPieceInitial,
  Board,
  Color,
  CoordsGenerator,
  King,
  Knight,
  Pawn,
  PieceInitial,
  PieceOffsets,
  Queen,
  Rook,
  WhitePieceInitial,
  Wings
} from "@chacomat/types.local.js";
import Coords from "@chacomat/utils/Coords.js";

export default abstract class Piece {
  static readonly offsets: PieceOffsets;
  static readonly pieceClassesByInitial = new Map<WhitePieceInitial, typeof Piece>();
  static readonly pieceInitialsByClass = new Map<typeof Piece, WhitePieceInitial>();

  static readonly START_RANKS = {
    WHITE: 7,
    BLACK: 0
  };

  static readonly MIDDLE_RANKS = {
    WHITE: 4,
    BLACK: 3
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

  static get whiteInitial(): WhitePieceInitial {
    return this.pieceInitialsByClass.get(this);
  }

  static fromInitial(initial: PieceInitial): Piece {
    const whiteInitial = initial.toUpperCase() as WhitePieceInitial;
    return Reflect.construct(this.pieceClassesByInitial.get(whiteInitial), [
      (initial === whiteInitial) ? "WHITE" : "BLACK"
    ]) as Piece;
  }

  readonly color: Color;
  coords: Coords;
  board: Board;

  constructor(color: Color) {
    this.color = color;
  }

  get pieceClass(): typeof Piece {
    return this.constructor as typeof Piece;
  }

  get initial(): PieceInitial {
    if (this.color === "WHITE")
      return this.pieceClass.whiteInitial;
    return this.pieceClass.whiteInitial.toLowerCase() as BlackPieceInitial;
  }

  get direction(): number {
    return this.pieceClass.DIRECTIONS[this.color];
  }

  get offsets(): PieceOffsets {
    return this.pieceClass.offsets;
  }

  get oppositeColor(): Color {
    return ReversedColor[this.color];
  }

  get x() {
    return this.coords.x;
  }

  get y() {
    return this.coords.y;
  }

  isOnStartRank(): boolean {
    return this.x === this.pieceClass.START_RANKS[this.color];
  }

  *attackedCoords(): CoordsGenerator {
    for (let i = 0; i < this.offsets.x.length; i++) {
      const attackedCoords = this.coords.getPeer(this.offsets.x[i], this.offsets.y[i]);
      if (attackedCoords)
        yield attackedCoords;
    }
  }

  *pseudoLegalMoves(): CoordsGenerator {
    for (const targetCoords of this.attackedCoords())
      if (this.board.get(targetCoords)?.color !== this.color)
        yield targetCoords;
  }

  clone(): Piece {
    return Reflect.construct(this.pieceClass, [this.color]);
  }

  isPawn(): this is Pawn {
    return this.pieceClass.name === "Pawn";
  }

  isKnight(): this is Knight {
    return this.pieceClass.name === "Knight";
  }

  isRook(): this is Rook {
    return this.pieceClass.name === "Rook";
  }

  isQueen(): this is Queen {
    return this.pieceClass.name === "Queen";
  }

  isBishop(): this is Bishop {
    return this.pieceClass.name === "Bishop";
  }

  isKing(): this is King {
    return this.pieceClass.name === "King";
  }
}