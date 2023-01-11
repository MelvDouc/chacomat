import Coords from "./Coords.js";
import GameStatus from "../constants/GameStatus.js";
import type {
  AlgebraicSquareNotation,
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
  public move(
    srcCoords: { x: number; y: number; },
    destCoords: { x: number; y: number; },
    promotionType: Promotable = "Q"
  ): this {
    if (this.currentPosition.status !== GameStatus.ACTIVE)
      throw new Error(`Position is inactive: ${this.currentPosition.status}`);

    srcCoords = Coords.get(srcCoords.x, srcCoords.y)!;
    destCoords = Coords.get(destCoords.x, destCoords.y)!;
    const { legalMoves } = this.currentPosition;

    if (!legalMoves.some(([srcCoords2, destCoords2]) =>
      srcCoords2 === srcCoords && destCoords2 === destCoords
    ))
      throw new Error(`Ilegal move: ${(srcCoords as Coords).notation}-${(destCoords as Coords).notation}`);

    const nextPosition = this.currentPosition.getPositionFromMove(
      srcCoords as Coords,
      destCoords as Coords,
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
      Coords.fromNotation(srcNotation)!,
      Coords.fromNotation(destNotation)!,
      promotionType,
    );
  }
}
