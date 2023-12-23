import Position from "$src/game/Position.js";
import type Move from "$src/moves/AbstractMove.js";
import NullMove from "$src/moves/NullMove.js";
import PawnMove from "$src/moves/PawnMove.js";
import RealMove from "$src/moves/RealMove.js";
import playMoves from "$src/utils/play-moves.js";
import { GameResult, GameResults, PGNHeaders, PGNParser } from "pgnify";

export default class ChessGame {
  public static fromPGN(pgn: string) {
    const parser = new PGNParser(pgn);
    const game = new this({ info: parser.headers });
    playMoves(game, parser.mainLine);
    return game;
  }

  public readonly info: PGNHeaders;
  public currentPosition: Position;

  public constructor(params?: {
    info: PGNHeaders;
    moveString?: string;
  }) {
    this.info = params?.info ?? {};
    this.info.Result ??= GameResults.NONE;
    this.currentPosition = Position.fromFEN(this.info.FEN ?? Position.START_FEN);

    if (params?.moveString) {
      const parser = new PGNParser(params.moveString);
      playMoves(this, parser.mainLine);
    }
  }

  public get firstPosition() {
    let pos = this.currentPosition;
    while (pos.prev) pos = pos.prev;
    return pos;
  }

  public get lastPosition() {
    let pos = this.currentPosition;
    while (pos.next[0]) pos = pos.next[0];
    return pos;
  }

  public get currentResult(): GameResult {
    const pos = this.currentPosition;

    if (pos.isCheckmate())
      return (pos.activeColor.isWhite())
        ? GameResults.BLACK_WIN
        : GameResults.WHITE_WIN;

    if (
      pos.isStalemate()
      || pos.isInsufficientMaterial()
      || pos.isTripleRepetition()
      || pos.halfMoveClock >= 50
    )
      return GameResults.DRAW;

    return GameResults.NONE;
  }

  public goBack() {
    const { prev } = this.currentPosition;
    if (prev) this.currentPosition = prev;
  }

  public goToStart() {
    this.currentPosition = this.firstPosition;
  }

  public goForward() {
    const [next] = this.currentPosition.next;
    if (next) this.currentPosition = next;
  }

  public goToEnd() {
    this.currentPosition = this.lastPosition;
  }

  public truncatePreviousMoves() {
    delete this.currentPosition.prev;

    if (this.currentPosition.fullMoveNumber !== 1 || !this.currentPosition.activeColor.isWhite())
      this.info.FEN = this.currentPosition.toFEN();
  }

  public truncateFromCurrentPosition() {
    this.goBack();
    this.currentPosition.next.length = 0;
  }

  public playMove(move: Move) {
    const pos = this.currentPosition,
      board = pos.board.clone(),
      castlingRights = pos.castlingRights.clone();

    move.play(board);
    if (move instanceof RealMove) castlingRights.update(move);

    const nextPos = new Position(
      board,
      pos.inactiveColor,
      castlingRights,
      (move instanceof PawnMove && move.isDouble()) ? (move.srcIndex + move.destIndex) / 2 : null,
      (move.isCapture() || move instanceof PawnMove) ? 0 : (pos.halfMoveClock + 1),
      pos.fullMoveNumber + Number(!pos.activeColor.isWhite())
    );
    nextPos.srcMove = move;
    nextPos.prev = pos;
    pos.next.push(nextPos);
    this.currentPosition = nextPos;
    return this;
  }

  public playMoveWithPoints(srcX: number, srcY: number, destX: number, destY: number, promotionInitial?: string) {
    const move = this.currentPosition.legalMoves.find((m) => {
      return m.srcPoint.x === srcX
        && m.srcPoint.y === srcY
        && m.destPoint.x === destX
        && m.destPoint.y === destY
        && (
          !promotionInitial
          || m instanceof PawnMove && m.promotionInitial === promotionInitial
        );
    });

    if (!move)
      throw new Error("Illegal move.", {
        cause: {
          position: this.currentPosition,
          srcX,
          srcY,
          destX,
          destY
        }
      });

    return this.playMove(move);
  }

  /**
   * @param notation A computer notation like "e2e4" or "a2a1Q".
   * @returns This same game.
   */
  public playMoveWithNotation(notation: string) {
    const move = this.currentPosition.legalMoves.find((move) => {
      return move.getComputerNotation() === notation;
    });

    if (!move)
      throw new Error("Illegal move.", {
        cause: {
          notation,
          position: this.currentPosition
        }
      });

    return this.playMove(move);
  }

  public playNullMove() {
    return this.playMove(NullMove.instance);
  }

  public getInfoAsString() {
    return Object.entries(this.info)
      .map(([key, value]) => `[${key} "${value}"]`)
      .join("\n");
  }

  public toPGN() {
    return `${this.getInfoAsString()}\n\n${this.firstPosition.toMoveString()} ${this.info.Result}`;
  }

  public toString() {
    return this.toPGN();
  }
}