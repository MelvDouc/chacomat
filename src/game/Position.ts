import Color from "$src/constants/Color.js";
import SquareIndex from "$src/constants/SquareIndex.js";
import { BOARD_WIDTH } from "$src/constants/dimensions.js";
import InvalidFenError from "$src/errors/InvalidFenError.js";
import Board from "$src/game/Board.js";
import CastlingRights from "$src/game/CastlingRights.js";
import RealMove from "$src/moves/RealMove.js";
import { castlingMoves, nonCastlingMoves } from "$src/utils/generate-moves.js";
import { isInsufficientMaterial } from "$src/utils/insufficient-material.js";
import type { JSONPosition } from "$src/typings/types.js";

export default class Position {
  public static readonly START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w kqKQ - 0 1";

  private static readonly _fenRegex = /^[PNBRQKpnbrqk1-8]{1,8}(\/[PNBRQKpnbrqk1-8]{1,8}){7} (w|b) ([kqKQ]{1,4}|-) ([a-h][1-8]|-) \d+ \d+$/;

  public static isValidFEN(fen: string) {
    return this._fenRegex.test(fen);
  }

  /**
   * @throws {InvalidFenError}
   */
  public static fromFEN(fen: string) {
    if (!this.isValidFEN(fen))
      throw new InvalidFenError(fen);

    const [board, colorAbbrev, castling, enPassant, halfMoveClock, fullMoveNumber] = fen.split(" ");

    return new this(
      Board.fromString(board),
      Color.fromAbbreviation(colorAbbrev),
      CastlingRights.fromString(castling),
      SquareIndex[enPassant as keyof typeof SquareIndex] ?? null,
      +halfMoveClock,
      +fullMoveNumber
    );
  }

  public comment?: string;
  private _legalMoves?: RealMove[];
  private _isCheck?: boolean;

  public constructor(
    public readonly board: Board,
    public readonly activeColor: Color,
    public readonly castlingRights: CastlingRights,
    public readonly enPassantIndex: SquareIndex | null,
    public readonly halfMoveClock: number,
    public readonly fullMoveNumber: number
  ) { }

  public get inactiveColor() {
    return this.activeColor.opposite;
  }

  public get legalMoves() {
    return this._legalMoves ??= [...nonCastlingMoves(this), ...castlingMoves(this)];
  }

  public get legalMovesAsAlgebraicNotation() {
    return this.legalMoves.map((move) => move.getAlgebraicNotation(this));
  }

  public findMoveByComputerNotation(notation: string) {
    return this.legalMoves.find((move) => {
      return move.getComputerNotation() === notation;
    });
  }

  public isCheck() {
    return this._isCheck ??= this.board.isKingEnPrise(this.activeColor);
  }

  public isCheckmate() {
    return this.isCheck() && this.legalMoves.length === 0;
  }

  public isStalemate() {
    return !this.isCheck() && this.legalMoves.length === 0;
  }

  public isInsufficientMaterial() {
    return isInsufficientMaterial(this);
  }

  /**
   * Clone this position with colors reversed and its board mirrored vertically.
   */
  public reverse() {
    const castlingRights = new CastlingRights();
    castlingRights.white.queenSide = this.castlingRights.black.queenSide;
    castlingRights.white.kingSide = this.castlingRights.black.kingSide;
    castlingRights.black.queenSide = this.castlingRights.white.queenSide;
    castlingRights.black.kingSide = this.castlingRights.white.kingSide;

    const enPassantIndex = this.enPassantIndex
      ? this.enPassantIndex - 3 * BOARD_WIDTH * this.activeColor.direction
      : null;

    return new Position(
      this.board.mirror({ vertically: true, swapColors: true }),
      this.inactiveColor,
      castlingRights,
      enPassantIndex,
      this.halfMoveClock,
      this.fullMoveNumber
    );
  }

  public toFEN() {
    return [
      this.board.toString(),
      this.activeColor.abbreviation,
      this.castlingRights.toString(),
      this.enPassantIndex !== null ? SquareIndex[this.enPassantIndex] : "-",
      this.halfMoveClock,
      this.fullMoveNumber
    ].join(" ");
  }

  public toJSON(): JSONPosition {
    return {
      board: this.board.toArray(),
      activeColor: this.activeColor.name,
      castlingRights: this.castlingRights.toJSON(),
      enPassantIndex: this.enPassantIndex,
      halfMoveClock: this.halfMoveClock,
      fullMoveNumber: this.fullMoveNumber
    };
  }
}