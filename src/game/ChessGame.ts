import Colors from "$src/constants/Colors";
import IllegalMoveError from "$src/errors/IllegalMoveError";
import Position from "$src/game/Position";
import NullMove from "$src/moves/NullMove";
import PawnMove from "$src/moves/PawnMove";
import RealMove from "$src/moves/RealMove";
import { Move, PGNHeaders } from "$src/typings/types";
import playMoves from "$src/utils/play-moves";
import { GameResults, PGNParser } from "pgnify";

export default class ChessGame {
  static fromPGN(pgn: string) {
    const parser = new PGNParser(pgn);
    const game = new this({ info: parser.headers });
    playMoves(game, parser.mainLine);
    return game;
  }

  readonly info: PGNHeaders;
  currentPosition: Position;

  constructor(params?: {
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

  get firstPosition() {
    let pos = this.currentPosition;
    while (pos.prev) pos = pos.prev;
    return pos;
  }

  get lastPosition() {
    let pos = this.currentPosition;
    while (pos.next[0]) pos = pos.next[0];
    return pos;
  }

  get currentResult() {
    const pos = this.currentPosition;

    if (pos.isCheckmate())
      return (pos.activeColor === Colors.WHITE)
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

  goBack() {
    const { prev } = this.currentPosition;
    if (prev) this.currentPosition = prev;
  }

  goToStart() {
    this.currentPosition = this.firstPosition;
  }

  goForward() {
    const [next] = this.currentPosition.next;
    if (next) this.currentPosition = next;
  }

  goToEnd() {
    this.currentPosition = this.lastPosition;
  }

  truncatePreviousMoves() {
    delete this.currentPosition.prev;

    if (this.currentPosition.fullMoveNumber !== 1 || this.currentPosition.activeColor !== Colors.WHITE)
      this.info.FEN = this.currentPosition.toFEN();
  }

  truncateFromCurrentPosition() {
    this.goBack();
    this.currentPosition.next.length = 0;
  }

  playMove(move: Move) {
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
      pos.fullMoveNumber + Number(pos.activeColor === Colors.BLACK)
    );
    nextPos.srcMove = move;
    nextPos.prev = pos;
    pos.next.push(nextPos);
    this.currentPosition = nextPos;
    return this;
  }

  playMoveWithPoints(srcX: number, srcY: number, destX: number, destY: number, promotionInitial?: string) {
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

    if (!move) {
      const error = new IllegalMoveError("Illegal move.");
      error.position = this.currentPosition;
      error.srcPoint = { x: srcX, y: srcY };
      error.destPoint = { x: destX, y: destY };
      throw error;
    }

    return this.playMove(move);
  }

  /**
   * @param notation A computer notation like "e2e4" or "a2a1Q".
   * @returns This same game.
   */
  playMoveWithNotation(notation: string): this {
    const move = this.currentPosition.legalMoves.find((move) => {
      return move.getComputerNotation() === notation;
    });

    if (!move) {
      const error = new IllegalMoveError(`Illegal move: "${notation}".`);
      error.position = this.currentPosition;
      throw error;
    }

    return this.playMove(move);
  }

  playNullMove() {
    return this.playMove(NullMove.instance);
  }

  getInfoAsString() {
    return Object.entries(this.info)
      .map(([key, value]) => `[${key} "${value}"]`)
      .join("\n");
  }

  toPGN() {
    return `${this.getInfoAsString()}\n\n${this.firstPosition.toMoveString()} ${this.info.Result}`;
  }

  toString() {
    return this.toPGN();
  }
}