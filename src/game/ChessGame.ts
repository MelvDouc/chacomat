import { coordsToNotation, notationToCoords } from "../constants/coords.js";
import GameStatus from "../constants/GameStatus.js";
import type {
  AlgebraicSquareNotation,
  Coords,
  FenString,
  PositionInfo,
  Promotable,
} from "../types.js";
import Position from "./Position.js";

/**
 * @classdesc Represents a sequence of positions and variations in a chess game. New positions are created by playing moves.
 */
export default class ChessGame {
  public static readonly Statuses = GameStatus;

  public currentPosition: Position;

  constructor(fenStringOrPositionInfo: FenString | PositionInfo = Position.startFenString) {
    this.currentPosition = (typeof fenStringOrPositionInfo === "string")
      ? Position.fromFenString(fenStringOrPositionInfo)
      : new Position(fenStringOrPositionInfo);
  }

  public get status(): GameStatus {
    return this.currentPosition.status;
  }

  /**
   * Assumes an indexed 64-square board where a8 is 0 and h1 is 63.
   * @param srcCoords The coords of the source square. Must contain a piece who can legally move in the current position.
   * @param destCoords The coords of the square the source piece will move to.
   * @param promotionType Optional. Will default to 'Q' if no argument was passed during a promotion.
   * @returns The current instance of a game containing the position after the move.
   */
  public move(srcCoords: Coords, destCoords: Coords, promotionType: Promotable = "Q"): this {
    if (this.currentPosition.status !== GameStatus.ACTIVE)
      throw new Error(`Position is inactive: ${this.currentPosition.status}`);

    const { legalMoves } = this.currentPosition;

    if (!legalMoves.some(([src, dest]) =>
      src.x === srcCoords.x && src.y === srcCoords.y &&
      dest.x === destCoords.x && dest.y === destCoords.y
    ))
      throw new Error(`Ilegal move: ${coordsToNotation(srcCoords)}-${coordsToNotation(destCoords)}`);

    const nextPosition = this.currentPosition.getPositionFromMove(
      srcCoords,
      destCoords,
      promotionType,
      true
    );
    nextPosition.prev = this.currentPosition;
    this.currentPosition.next.push(nextPosition);
    this.currentPosition = nextPosition;

    return this;
  }

  public moveWithNotations(
    srcNotation: AlgebraicSquareNotation,
    destNotation: AlgebraicSquareNotation,
    promotionType: Promotable = "Q",
  ): this {
    return this.move(
      notationToCoords(srcNotation)!,
      notationToCoords(destNotation)!,
      promotionType,
    );
  }
}
