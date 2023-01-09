import Color from "../constants/Color.js";
import { coordsToNotation, notationToCoords } from "../constants/coords.js";
import GameStatus from "../constants/GameStatus.js";
import Wing from "../constants/Wing.js";
import Piece from "../pieces/Piece.js";
import type {
  AlgebraicSquareNotation,
  AttackedCoordsRecord,
  Coords,
  FenString,
  ICastlingRights,
  Move,
  PositionInfo,
  Promotable,
} from "../types.js";
import Board from "./Board.js";
import CastlingRights from "./CastlingRights.js";

/**
 * @classdesc An instance of this class is an immutable description of a position in a game. Its status cannot be altered.
 */
export default class Position implements PositionInfo {
  static readonly startFenString: FenString =
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  /**
   * Create a new position using only an FEN string.
   */
  static fromFenString(fenString: FenString) {
    const [
      pieceString,
      color,
      castlingString,
      enPassant,
      halfMoveClock,
      fullMoveNumber,
    ] = fenString.split(" ");
    return new Position({
      board: Board.fromPieceString(pieceString),
      castlingRights: CastlingRights.fromString(castlingString),
      colorToMove: (color === "w") ? Color.WHITE : Color.BLACK,
      enPassantFile: (enPassant === "-")
        ? -1
        : notationToCoords(enPassant as AlgebraicSquareNotation)!.y,
      halfMoveClock: +halfMoveClock,
      fullMoveNumber: +fullMoveNumber,
    });
  }

  static #getWing(file: number) {
    return (file < 4) ? Wing.QUEEN_SIDE : Wing.KING_SIDE;
  }

  readonly board!: Board;
  readonly castlingRights!: ICastlingRights;
  readonly colorToMove!: Color;
  /**
   * The empty square index where an en passant capture can be played.
   */
  readonly enPassantFile!: number;
  readonly halfMoveClock!: number;
  readonly fullMoveNumber!: number;
  #attackedCoords!: AttackedCoordsRecord;
  #legalMoves!: Move[];
  prev: Position | null = null;
  next: Position[] = [];

  constructor(positionInfo: PositionInfo) {
    Object.assign(this, positionInfo);
  }

  /**
   * A set containing the coords controlled by the currently inactive color.
   */
  get attackedCoords(): AttackedCoordsRecord {
    return this.#attackedCoords ??= this.board.getAttackedCoords(
      -this.colorToMove as Color,
    );
  }

  get legalMoves(): Move[] {
    if (this.#legalMoves) {
      return this.#legalMoves;
    }

    this.#legalMoves = [];

    for (const move of this.#pseudoLegalMoves()) {
      if (!this.getPositionFromMove(move[0], move[1]).isCheck()) {
        this.#legalMoves.push(move);
      }
    }

    if (!this.isCheck()) {
      const kingCoords = this.board.kingCoords[this.colorToMove];
      for (const castlingIndex of Piece.castlingCoords(kingCoords, this)) {
        this.#legalMoves.push([kingCoords, castlingIndex]);
      }
    }

    return this.#legalMoves;
  }

  /**
   * @returns A human-readable array of moves as strings following the pattern `e2-e4`.
   */
  get legalMovesAsNotation(): string[] {
    return this.legalMoves.map(([srcCoords, destCoords]) =>
      `${coordsToNotation(srcCoords)}-${coordsToNotation(destCoords)}`
    );
  }

  /**
   * Determine whether the position is active, checkmate or a draw and what kind of draw.
   */
  get status(): GameStatus {
    if (this.board.pieceCount < 3) {
      return GameStatus.INSUFFICIENT_MATERIAL;
    }
    if (this.halfMoveClock > 50) {
      return GameStatus.FIFTY_MOVE_DRAW;
    }
    if (!this.legalMoves.length) {
      return (this.isCheck()) ? GameStatus.CHECKMATE : GameStatus.STALEMATE;
    }
    return GameStatus.ACTIVE;
  }

  isCheck(): boolean {
    const { x, y } = this.board.kingCoords[this.colorToMove];
    return this.attackedCoords[x] && this.attackedCoords[x][y] === true;
  }

  /**
   * Generates the moves that could be played without regard for whether it puts the current player in check.
   */
  *#pseudoLegalMoves(): Generator<Move, void, unknown> {
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        if (this.board[x][y]?.color === this.colorToMove) {
          const srcCoords = { x, y };
          for (
            const destCoords of this.board[x][y]!.pseudoLegalMoves(
              srcCoords,
              this,
            )
          ) {
            yield [srcCoords, destCoords] as Move;
          }
        }
      }
    }
  }

  /**
   * This is to be checked before the src piece has moved and the color to move has been updated.
   */
  #isPromotion(destCoords: Coords): boolean {
    return destCoords.y ===
      Piece.INITIAL_PIECE_RANKS[-this.colorToMove as Color];
  }

  /**
   * The color to move isn't updated just yet as this position will be used to verify if a move has put the currently active color in check.
   */
  getPositionFromMove(
    srcCoords: Coords,
    destCoords: Coords,
    promotionType: Promotable = "Q",
    updateColorAndMoveNumber = false,
  ): Position {
    const { board, castlingRights } = this.clone();

    const srcPiece = board[srcCoords.x][srcCoords.y] as Piece,
      destPiece = board[destCoords.x][destCoords.y];

    const isSrcPiecePawn = srcPiece.type === Piece.Types.PAWN;
    const isCaptureOrPawnMove = !!destPiece || isSrcPiecePawn;

    switch (srcPiece.type) {
      case Piece.Types.PAWN:
        if (destCoords.y === this.enPassantFile) {
          board[srcCoords.x][destCoords.y] = null;
        } else if (this.#isPromotion(destCoords)) {
          Piece.promote(srcPiece, promotionType);
        }
        break;
      case Piece.Types.KING:
        castlingRights[srcPiece.color][Wing.QUEEN_SIDE] = false;
        castlingRights[srcPiece.color][Wing.KING_SIDE] = false;
        if (Math.abs(destCoords.y - srcCoords.y) > 1) {
          const wing = Position.#getWing(destCoords.y);
          board.transfer(
            { x: srcCoords.x, y: wing },
            { x: srcCoords.x, y: Piece.CASTLED_ROOK_FILES[wing] },
          );
        }
        break;
      case Piece.Types.ROOK:
        if (
          srcCoords.x === Piece.INITIAL_PIECE_RANKS[srcPiece.color] &&
          (srcCoords.y === Wing.QUEEN_SIDE || srcCoords.y === Wing.KING_SIDE)
        ) {
          castlingRights[srcPiece.color][srcCoords.y] = false;
        }
    }

    if (
      destPiece?.type === Piece.Types.KING &&
      destCoords.y === Piece.INITIAL_PIECE_RANKS[srcPiece.color] &&
      (destCoords.y === Wing.QUEEN_SIDE || destCoords.y === Wing.KING_SIDE)
    ) {
      castlingRights[destPiece.color][destCoords.y] = false;
    }

    board.transfer(srcCoords, destCoords);

    return new Position({
      board,
      castlingRights,
      enPassantFile:
        (isSrcPiecePawn && Math.abs(destCoords.x - srcCoords.x) > 1)
          ? srcCoords.y
          : -1,
      colorToMove: (updateColorAndMoveNumber)
        ? -this.colorToMove as Color
        : this.colorToMove,
      halfMoveClock: (isCaptureOrPawnMove) ? 0 : this.halfMoveClock + 1,
      fullMoveNumber: this.fullMoveNumber +
        +(updateColorAndMoveNumber && this.colorToMove === Color.BLACK),
    });
  }

  /**
   * @returns A deep clone of this position.
   */
  clone(): Position {
    return new Position({
      board: this.board.clone(),
      castlingRights: this.castlingRights.clone(),
      colorToMove: this.colorToMove,
      enPassantFile: this.enPassantFile,
      halfMoveClock: this.halfMoveClock,
      fullMoveNumber: this.fullMoveNumber,
    });
  }

  toString(): FenString {
    return [
      this.board.toString(),
      (this.colorToMove === Color.WHITE) ? "w" : "b",
      this.castlingRights.toString(),
      (this.enPassantFile === -1) ? "-" : coordsToNotation({
        y: this.enPassantFile,
        x: Piece.MIDDLE_RANKS[this.colorToMove] + this.colorToMove,
      }),
      String(this.halfMoveClock),
      String(this.fullMoveNumber),
    ].join(" ");
  }
}
