import Position from "@chacomat/game/Position.js";
import type {
  AlgebraicSquareNotation,
  Color,
  Coords,
  GameMetaInfo,
  GameParameters,
  PromotedPieceType
} from "@chacomat/types.local.js";
import {
  IllegalMoveError,
  InactiveGameError,
  InvalidFenError
} from "@chacomat/utils/errors.js";
import { notationToCoords } from "@chacomat/utils/Index.js";
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
      return (position.isCheck())
        ? ChessGame.statuses.CHECKMATE
        : ChessGame.statuses.STALEMATE;
    if (position.isInsufficientMaterial())
      return ChessGame.statuses.INSUFFICIENT_MATERIAL;
    if (position.halfMoveClock > 50)
      return ChessGame.statuses.FIFTY_MOVE_DRAW;
    if (this.isTripleRepetition())
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

  isTripleRepetition(): boolean {
    const pieceStr = this.currentPosition.board.toString();
    let repetitionCount = 0;

    for (
      let pos = this.currentPosition.prev;
      pos !== null && repetitionCount < 3;
      pos = pos.prev
    ) {
      if (pos.colorToMove === this.currentPosition.colorToMove && pos.board.toString() === pieceStr)
        repetitionCount++;
    }

    return repetitionCount === 3;
  }

  move(srcCoords: Coords, destCoords: Coords, promotionType?: PromotedPieceType): this {
    const { status } = this;

    if (status !== ChessGame.statuses.ACTIVE)
      throw new ChessGame.errors.InactiveGameError(status);

    if (!this.currentPosition.legalMoves.some(([src, dest]) => {
      return src.x == srcCoords.x
        && src.y === srcCoords.y
        && dest.x == destCoords.x
        && dest.y === destCoords.y;
    }))
      throw new ChessGame.errors.IllegalMoveError(srcCoords, destCoords);

    const nextPosition = this.currentPosition.createPositionFromMove(srcCoords, destCoords, promotionType);
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
      notationToCoords(srcNotation),
      notationToCoords(destNotation),
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

  goToMove(moveNumber: number, color: Color = "WHITE"): this {
    if (moveNumber < this.currentPosition.fullMoveNumber)
      return this.#goToMoveWithCallback(moveNumber, color, (pos) => pos.prev);

    if (moveNumber > this.currentPosition.fullMoveNumber)
      return this.#goToMoveWithCallback(moveNumber, color, (pos) => pos.next[0]);

    if (color === "WHITE" && this.currentPosition.colorToMove === "BLACK") {
      if (this.currentPosition.prev)
        this.currentPosition = this.currentPosition.prev;
    } else if (color === "BLACK" && this.currentPosition.colorToMove === "WHITE") {
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