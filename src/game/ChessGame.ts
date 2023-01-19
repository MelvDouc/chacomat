import Coords from "@chacomat/game/Coords.js";
import Position from "@chacomat/game/Position.js";
import Color from "@chacomat/utils/Color.js";
import { GameStatus } from "@chacomat/utils/constants.js";
import {
  IllegalMoveError,
  InactiveGameError,
  InvalidFenError
} from "@chacomat/utils/errors.js";
import type {
  AlgebraicSquareNotation,
  BlackAndWhite,
  ChessGameMetaInfo,
  ChessGameParameters,
  PromotedPieceType,
} from "@chacomat/types.js";

/**
 * @classdesc Represents a sequence of positions and variations in a chess game. New positions are created by playing moves.
 */
export default class ChessGame {
  static readonly Position = Position;
  static readonly errors = {
    IllegalMoveError: IllegalMoveError,
    InactiveGameError: InactiveGameError,
    InvalidFenError: InvalidFenError
  };

  currentPosition: InstanceType<typeof Position>;
  readonly metaInfo: Partial<ChessGameMetaInfo>;

  constructor({ fenString, positionInfo, metaInfo }: ChessGameParameters = {}) {
    const PositionConstructor = (this.constructor as typeof ChessGame).Position;
    const position = (positionInfo)
      ? new PositionConstructor(positionInfo)
      : PositionConstructor.fromFenString(fenString ?? Position.startFenString);
    position.game = this;
    this.currentPosition = position;
    this.metaInfo = metaInfo ?? {};
  }

  /**
   * Determine whether the position is active, checkmate or a draw and what kind of draw.
   */
  get status(): GameStatus {
    const position = this.currentPosition;
    if (!position.legalMoves.length)
      return (position.isCheck()) ? GameStatus.CHECKMATE : GameStatus.STALEMATE;
    if (position.isInsufficientMaterial())
      return GameStatus.INSUFFICIENT_MATERIAL;
    if (position.halfMoveClock > 50)
      return GameStatus.FIFTY_MOVE_DRAW;
    if (position.isTripleRepetition())
      return GameStatus.TRIPLE_REPETITION;
    return GameStatus.ACTIVE;
  }

  /**
   * Play a move using coordinates such that a8 is {x: 0, y: 0} and h1 is {x: 7, y: 7}.
   * @param srcCoords The coords of the source square. Must contain a piece which can legally move in the current position.
   * @param destCoords The coords of the square the source piece will move to.
   * @param promotionType Optional. Will default to 'Q' if no argument was passed during a promotion.
   * @returns The current instance of a game containing the position after the move.
   */
  move(
    srcCoords: { x: number; y: number; },
    destCoords: { x: number; y: number; },
    promotionType?: PromotedPieceType
  ): this {
    const { status } = this;

    if (status !== GameStatus.ACTIVE)
      throw new ChessGame.errors.InactiveGameError(status);

    if (!this.currentPosition.legalMoves.some(([src, dest]) =>
      src.x === srcCoords.x
      && src.y === srcCoords.y
      && dest.x === destCoords.x
      && dest.y === destCoords.y
    ))
      throw new ChessGame.errors.IllegalMoveError(srcCoords, destCoords);

    const nextPosition = this.currentPosition.createPositionFromMove(
      Coords(srcCoords.x, srcCoords.y),
      Coords(destCoords.x, destCoords.y),
      promotionType,
      true
    );
    nextPosition.game = this;
    nextPosition.prev = this.currentPosition;
    this.currentPosition.next.push(nextPosition);
    this.currentPosition = nextPosition;

    return this;
  }

  /**
   * Play a move using algebraic square notations.
   * @param srcNotation The notation of the source square. Must contain a piece which can legally move in the current position.
   * @param destNotation The notation of the square the source piece will move to.
   * @param promotionType Optional. Will default to 'Q' if no argument was passed during a promotion.
   * @returns The current instance of a game containing the position after the move.
   */
  moveWithNotations(
    srcNotation: AlgebraicSquareNotation,
    destNotation: AlgebraicSquareNotation,
    promotionType?: PromotedPieceType
  ): this {
    return this.move(
      Coords.fromNotation(srcNotation)!,
      Coords.fromNotation(destNotation)!,
      promotionType
    );
  }

  goToMove(moveNumber: number, color: Color = Color.WHITE, variationIndex = 0): this {
    const positions = {} as Record<number, Partial<BlackAndWhite<Position>>>;

    for (
      let position = this.currentPosition;
      position;
      position = position.prev
    ) {
      positions[position.fullMoveNumber] ??= {};
      positions[position.fullMoveNumber][position.colorToMove] = position;
    }

    for (
      let position = this.currentPosition;
      position;
      position = position.next[0]
    ) {
      positions[position.fullMoveNumber] ??= {};
      positions[position.fullMoveNumber][position.colorToMove] = position;
    }

    if (moveNumber in positions && color in positions[moveNumber] && variationIndex in positions[moveNumber][color])
      this.currentPosition = positions[moveNumber][color];

    return this;
  }

  /**
   * Pretty print this game's current board to the console.
   */
  logBoard(): void {
    this.currentPosition.board.log();
  }
}
