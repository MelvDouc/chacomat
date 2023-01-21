import Color from "@chacomat/constants/Color.js";
import Position from "@chacomat/game/Position.js";
import type {
  AlgebraicSquareNotation,
  GameMetaInfo,
  GameParameters,
  PromotedPieceType
} from "@chacomat/types.local.js";
import {
  IllegalMoveError,
  InactiveGameError,
  InvalidFenError
} from "@chacomat/utils/errors.js";
import { notationToIndex } from "@chacomat/utils/Index.js";
import enterPgn from "@chacomat/utils/pgn/pgn.js";

/**
 * @classdesc Represents a sequence of positions and variations in a chess game. New positions are created by playing moves.
 */
export default class ChessGame {
  static readonly Position = Position;
  static readonly statuses = {
    ACTIVE: "active",
    CHECKMATE: "checkmate",
    STALEMATE: "stalemate",
    TRIPLE_REPETITION: "triple repetition",
    FIFTY_MOVE_DRAW: "draw by fifty-move rule",
    INSUFFICIENT_MATERIAL: "insufficient material"
  } as const;
  static readonly errors = {
    IllegalMoveError: IllegalMoveError,
    InactiveGameError: InactiveGameError,
    InvalidFenError: InvalidFenError
  };

  currentPosition: InstanceType<typeof ChessGame["Position"]>;
  readonly metaInfo: GameMetaInfo;

  constructor({ pgn, fen, positionParams, metaInfo }: GameParameters = {}) {
    const PositionConstructor = (this.constructor as typeof ChessGame).Position;

    if (typeof pgn === "string") {
      const { pgnInfo, enterMoves } = enterPgn(pgn);
      this.#setPosition(PositionConstructor.fromFenString(pgnInfo.FEN ?? fen ?? Position.startFenString));
      this.metaInfo = pgnInfo;
      enterMoves(this);
    } else {
      if (typeof fen === "string")
        this.#setPosition(PositionConstructor.fromFenString(fen));
      else if (positionParams)
        this.#setPosition(new PositionConstructor(positionParams));
      else
        this.#setPosition(PositionConstructor.fromFenString(Position.startFenString));
      this.metaInfo = metaInfo ?? {};
    }
  }

  /**
   * Determine whether the position is active, checkmate or a draw and what kind of draw.
   */
  get status(): string {
    const position = this.currentPosition;
    if (!position.legalMoves.length)
      return (position.isCheck()) ? ChessGame.statuses.CHECKMATE : ChessGame.statuses.STALEMATE;
    if (position.isInsufficientMaterial())
      return ChessGame.statuses.INSUFFICIENT_MATERIAL;
    if (position.halfMoveClock > 50)
      return ChessGame.statuses.FIFTY_MOVE_DRAW;
    if (position.isTripleRepetition())
      return ChessGame.statuses.TRIPLE_REPETITION;
    return ChessGame.statuses.ACTIVE;
  }

  get errors() {
    return (this.constructor as typeof ChessGame).errors;
  }

  #setPosition(position: Position): void {
    this.currentPosition = position;
    position.game = this;
  }

  /**
   * Play a move using board indices whereby a8 is 0, h8 is 7 and h1 is 63.
   * @param srcIndex The index of the source square. Must contain a piece which can legally move in the current position.
   * @param destIndex The index of the square the source piece will move to.
   * @param promotionType Optional. Will default to 'Q' if no argument was passed during a promotion.
   * @returns The current instance of a game containing the position after the move.
   */
  move(srcIndex: number, destIndex: number, promotionType?: PromotedPieceType): this {
    const { status } = this;

    if (status !== ChessGame.statuses.ACTIVE)
      throw new ChessGame.errors.InactiveGameError(status);

    if (!this.currentPosition.legalMoves.some(([src, dest]) => src === srcIndex && dest === destIndex))
      throw new ChessGame.errors.IllegalMoveError(srcIndex, destIndex);

    const nextPosition = this.currentPosition.createPositionFromMove(
      srcIndex,
      destIndex,
      promotionType,
      true
    );
    nextPosition.prev = this.currentPosition;
    this.currentPosition.next.push(nextPosition);
    this.#setPosition(nextPosition);

    return this;
  }

  /**
   * Play a move using algebraic square notations.
   * @param srcNotation The notation of the source square. Must contain a piece which can legally move in the current position.
   * @param destNotation The notation of the square the source piece will move to.
   * @param promotionType Optional. Will default to 'Q' if no argument was passed during a promotion.
   * @returns The current instance of a game containing the position after the move.
   */
  moveWithNotations(srcNotation: AlgebraicSquareNotation, destNotation: AlgebraicSquareNotation, promotionType?: PromotedPieceType): this {
    return this.move(
      notationToIndex(srcNotation),
      notationToIndex(destNotation),
      promotionType
    );
  }

  #goToMoveWithCallback(moveNumber: number, color: Color, callback: (position: Position) => Position | null | undefined): this {
    for (
      let position = this.currentPosition;
      position;
      position = callback(position)
    ) {
      if (position.fullMoveNumber === moveNumber && position.colorToMove === color) {
        this.currentPosition = position;
        break;
      }
    }

    return this;
  }

  goToMove(moveNumber: number, color: Color = Color.WHITE): this {
    if (moveNumber < this.currentPosition.fullMoveNumber)
      return this.#goToMoveWithCallback(moveNumber, color, (pos) => pos.prev);

    if (moveNumber > this.currentPosition.fullMoveNumber)
      return this.#goToMoveWithCallback(moveNumber, color, (pos) => pos.next[0]);

    if (color === Color.WHITE && this.currentPosition.colorToMove === Color.BLACK) {
      if (this.currentPosition.prev)
        this.currentPosition = this.currentPosition.prev;
    } else if (color === Color.BLACK && this.currentPosition.colorToMove === Color.WHITE) {
      if (this.currentPosition.next[0])
        this.currentPosition = this.currentPosition.next[0];
    }

    return this;
  }

  /**
   * Pretty print this game's current board to the console.
   */
  logBoard(): void {
    this.currentPosition.board.log();
  }
}