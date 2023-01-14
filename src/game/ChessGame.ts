import Coords from "./Coords.js";
import Position from "./Position.js";
import { Color, GameStatus, Wing } from "../utils/constants.js";
import { getRandomChessWhitePieceRank } from "../utils/fischer-random.js";
import { viewBoard } from "../utils/log.js";
import {
  IllegalMoveError,
  InactiveGameError,
  InvalidCoordsError,
  InvalidFenError
} from "../utils/errors.js";
import type {
  AlgebraicSquareNotation,
  ChessGameMetaInfo,
  ChessGameParameters,
  PromotedPieceInitial,
} from "../types.js";

/**
 * @classdesc Represents a sequence of positions and variations in a chess game. New positions are created by playing moves.
 */
export default class ChessGame {
  public static readonly Colors = Color;
  public static readonly Wings = Wing;
  public static readonly Statuses = GameStatus;
  public static readonly IllegalMoveError = IllegalMoveError;
  public static readonly InactiveGameError = InactiveGameError;
  public static readonly InvalidCoordsError = InvalidCoordsError;
  public static readonly InvalidFenError = InvalidFenError;

  public static getChess960Game(): ChessGame {
    const pieceRank = getRandomChessWhitePieceRank();
    return new ChessGame({
      isChess960: true,
      fenString: `${pieceRank.toLowerCase()}/${"p".repeat(8)}${"/8".repeat(4)}/${"P".repeat(8)}/${pieceRank} w KQkq - 0 1`
    });
  }

  public currentPosition: Position;
  public readonly isChess960: boolean;
  public readonly metaInfo: Partial<ChessGameMetaInfo>;

  constructor({ fenString, positionInfo, isChess960, metaInfo }: ChessGameParameters = {}) {
    this.currentPosition = positionInfo
      ? new Position(positionInfo)
      : Position.fromFenString(fenString ?? Position.startFenString);
    this.currentPosition.game = this;
    if (isChess960) {
      if (!this.currentPosition.board.updateStartRookFiles(this.currentPosition.castlingRights))
        throw new ChessGame.InvalidFenError(this.currentPosition.toString());
    }
    this.isChess960 = !!isChess960;
    this.metaInfo = metaInfo ?? {};
  }

  public get status(): GameStatus {
    return this.currentPosition.status;
  }

  /**
   * Play a move using coordinates such that a8 is {x: 0, y: 0} and h1 is {x: 7, y: 7}.
   * @param srcCoords The coords of the source square. Must contain a piece which can legally move in the current position.
   * @param destCoords The coords of the square the source piece will move to.
   * @param promotionType Optional. Will default to 'Q' if no argument was passed during a promotion.
   * @returns The current instance of a game containing the position after the move.
   */
  public move(
    srcCoords: { x: number; y: number; },
    destCoords: { x: number; y: number; },
    promotionType: PromotedPieceInitial = "Q"
  ): this {
    if (this.currentPosition.status !== GameStatus.ACTIVE)
      throw new ChessGame.InactiveGameError(this.currentPosition.status);

    if (!Coords.isValidCoords(srcCoords))
      throw new ChessGame.InvalidCoordsError(srcCoords);

    if (!Coords.isValidCoords(destCoords))
      throw new ChessGame.InvalidCoordsError(destCoords);

    if (!this.currentPosition.legalMoves.some(([src, dest]) =>
      src.x === srcCoords.x
      && src.y === srcCoords.y
      && dest.x === destCoords.x
      && dest.y === destCoords.y
    ))
      throw new ChessGame.IllegalMoveError(srcCoords, destCoords);

    const nextPosition = this.currentPosition.getPositionFromMove(
      Coords.get(srcCoords.x, srcCoords.y),
      Coords.get(destCoords.x, destCoords.y),
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
  public moveWithNotations(
    srcNotation: AlgebraicSquareNotation,
    destNotation: AlgebraicSquareNotation,
    promotionType: PromotedPieceInitial = "Q"
  ): this {
    return this.move(
      Coords.fromNotation(srcNotation)!,
      Coords.fromNotation(destNotation)!,
      promotionType
    );
  }

  /**
   * Pretty print this game's current board to the console.
   */
  public logBoard(): void {
    viewBoard(this.currentPosition.board);
  }
}
