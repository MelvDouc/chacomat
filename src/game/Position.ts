import Board from "$src/game/Board.js";
import CastlingRights from "$src/game/CastlingRights.js";
import Color from "$src/game/Color.js";
import Point from "$src/game/Point.js";
import { getTree, stringify as stringifyTree } from "$src/game/PositionTree.js";
import type Move from "$src/moves/Move.js";
import type { JSONPosition } from "$src/types.js";
import { InvalidFENError } from "$src/utils/errors.js";
import { castlingMoves, regularMoves } from "$src/utils/move-helpers.js";

export default class Position {
  public static readonly START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w kqKQ - 0 1";

  private static readonly _fenRegex = /^[PNBRQKpnbrqk1-8]{1,8}(\/[PNBRQKpnbrqk1-8]{1,8}){7} (w|b) ((?!.*(.).*\1)[KQkq]{1,4}|-) ([a-h][36]|-) \d+ \d+$/;

  public static isValidFEN(fen: string) {
    return this._fenRegex.test(fen);
  }

  /**
   * @throws {InvalidFENError}
   */
  public static fromFEN(fen: string) {
    if (!this.isValidFEN(fen))
      throw new InvalidFENError(fen);

    const [board, colorAbbrev, castling, enPassant, halfMoveClock, fullMoveNumber] = fen.split(" ");

    return new this({
      board: Board.fromString(board),
      activeColor: Color.fromAbbreviation(colorAbbrev),
      castlingRights: CastlingRights.fromString(castling),
      enPassantIndex: Point.fromNotation(enPassant)?.index ?? null,
      halfMoveClock: +halfMoveClock,
      fullMoveNumber: +fullMoveNumber
    });
  }

  public readonly board: Board;
  public readonly activeColor: Color;
  public readonly castlingRights: CastlingRights;
  public readonly enPassantIndex: number | null;
  public readonly halfMoveClock: number;
  public readonly fullMoveNumber: number;
  public prev?: Position;
  public readonly next: { move: Move; position: Position; }[] = [];
  private _legalMoves?: Move[];
  private _isCheck?: boolean;

  public constructor({ board, activeColor, castlingRights, enPassantIndex, halfMoveClock, fullMoveNumber }: {
    board: Board;
    activeColor: Color;
    castlingRights: CastlingRights;
    enPassantIndex: number | null;
    halfMoveClock: number;
    fullMoveNumber: number;
  }) {
    this.board = board;
    this.activeColor = activeColor;
    this.castlingRights = castlingRights;
    this.enPassantIndex = enPassantIndex;
    this.halfMoveClock = halfMoveClock;
    this.fullMoveNumber = fullMoveNumber;
  }

  public get inactiveColor() {
    return this.activeColor.opposite;
  }

  public get legalMoves() {
    return this._legalMoves ??= [...regularMoves(this), ...castlingMoves(this)];
  }

  public get legalMovesAsAlgebraicNotation() {
    return this.legalMoves.map((move) => move.getAlgebraicNotation(this));
  }

  public get root() {
    let pos: Position = this;
    while (pos.prev) pos = pos.prev;
    return pos;
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
    const { P, N, B, R, Q, p, n, b, r, q } = this.board.materialCount;

    if (P || R || Q || p || r || q)
      return false;

    const isWhiteToMove = this.activeColor.isWhite();
    const activeBishops = isWhiteToMove ? B : b;
    const activeKnights = isWhiteToMove ? N : n;
    const activeCount = (activeBishops ?? 0) + (activeKnights ?? 0);
    const inactiveBishops = isWhiteToMove ? b : B;
    const inactiveKnights = isWhiteToMove ? n : N;
    const inactiveCount = (inactiveBishops ?? 0) + (inactiveKnights ?? 0);

    if (activeCount === 0)
      return inactiveCount <= 1;

    if (activeCount > 1)
      return false;

    if (inactiveCount === 0)
      return true;

    if (inactiveCount > 1)
      return false;

    // check if same-colored bishops
    if (activeKnights || inactiveKnights)
      return false;

    const entries = this.board.getEntries();
    const [bishopIndex1] = entries.find(([, piece]) => {
      return piece.isBishop() && piece.color === this.activeColor;
    })!;
    const [bishopIndex2] = entries.find(([, piece]) => {
      return piece.isBishop() && piece.color === this.inactiveColor;
    })!;

    return Point.fromIndex(bishopIndex1).isLightSquare() === Point.fromIndex(bishopIndex2).isLightSquare();
  }

  public isTripleRepetition() {
    const { board } = this;
    let count = 1;
    let node = this.prev?.prev;

    while (node && count < 3) {
      if (node.board.pieceCount !== board.pieceCount)
        break;

      let isSameBoard = true;

      for (const [index, piece] of node.board.getEntries()) {
        if (board.get(index) !== piece) {
          isSameBoard = false;
          break;
        }
      }

      if (isSameBoard) count++;
      node = node.prev?.prev;
    }

    return count === 3;
  }

  public toFEN() {
    return [
      this.board.toString(),
      this.activeColor.abbreviation,
      this.castlingRights.toString(),
      this.enPassantIndex !== null ? Point.fromIndex(this.enPassantIndex).notation : "-",
      this.halfMoveClock,
      this.fullMoveNumber
    ].join(" ");
  }

  public toMoveString() {
    return stringifyTree(this.toTree());
  }

  public toTree() {
    return getTree(this, true, []);
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