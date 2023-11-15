import Colors from "$src/constants/Colors.ts";
import GameResults from "$src/constants/GameResults";
import IllegalMoveError from "$src/errors/IllegalMoveError.ts";
import Position from "$src/game/Position.ts";
import PawnMove from "$src/moves/PawnMove.ts";
import PGNParser from "$src/pgn-parser/Parser.ts";
import { Move, PGNHeaders } from "$src/typings/types.ts";
import playMoves from "$src/utils/play-moves.ts";

export default class ChessGame {
  static fromPGN(pgn: string) {
    const parser = new PGNParser(pgn);
    const game = new this(parser.headers);
    playMoves(game, parser.mainLine);
    return game;
  }

  readonly info: PGNHeaders;
  currentPosition: Position;

  constructor(info?: PGNHeaders) {
    this.info = info ?? { Result: GameResults.NONE };
    this.currentPosition = Position.fromFEN(this.info.FEN ?? Position.START_FEN);
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
    if (this.currentPosition.prev)
      this.currentPosition = this.currentPosition.prev;
  }

  goToStart() {
    this.currentPosition = this.firstPosition;
  }

  goForward() {
    if (this.currentPosition.next[0])
      this.currentPosition = this.currentPosition.next[0];
  }

  goToEnd() {
    this.currentPosition = this.lastPosition;
  }

  truncatePreviousMoves() {
    this.currentPosition.prev = null;

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
    castlingRights.update(move);

    const nextPos = new Position(
      board,
      pos.inactiveColor,
      castlingRights,
      (move instanceof PawnMove && move.isDouble()) ? (move.srcIndex + move.destIndex) / 2 : null,
      (move.destPiece || move instanceof PawnMove) ? 0 : (pos.halfMoveClock + 1),
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
    const pos = this.currentPosition;
    const nextPos = new Position(
      pos.board.clone(),
      pos.inactiveColor,
      pos.castlingRights.clone(),
      null,
      pos.halfMoveClock,
      pos.fullMoveNumber + Number(pos.activeColor === Colors.BLACK)
    );
    nextPos.prev = pos;
    pos.next.push(nextPos);
    this.currentPosition = nextPos;
    return this;
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