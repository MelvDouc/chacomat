import Colors from "$src/constants/Colors.ts";
import Position from "$src/game/Position.ts";
import NullMove from "$src/moves/NullMove.ts";
import PawnMove from "$src/moves/PawnMove.ts";
import RealMove from "$src/moves/RealMove.ts";
import { GameResult, Move, PGNHeaders } from "$src/typings/types.ts";
import playMoves from "$src/utils/play-moves.ts";
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

  get firstPosition(): Position {
    let pos = this.currentPosition;
    while (pos.prev) pos = pos.prev;
    return pos;
  }

  get lastPosition(): Position {
    let pos = this.currentPosition;
    while (pos.next[0]) pos = pos.next[0];
    return pos;
  }

  get currentResult(): GameResult {
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

  goBack(): void {
    const { prev } = this.currentPosition;
    if (prev) this.currentPosition = prev;
  }

  goToStart(): void {
    this.currentPosition = this.firstPosition;
  }

  goForward(): void {
    const [next] = this.currentPosition.next;
    if (next) this.currentPosition = next;
  }

  goToEnd(): void {
    this.currentPosition = this.lastPosition;
  }

  truncatePreviousMoves(): void {
    delete this.currentPosition.prev;

    if (this.currentPosition.fullMoveNumber !== 1 || this.currentPosition.activeColor !== Colors.WHITE)
      this.info.FEN = this.currentPosition.toFEN();
  }

  truncateFromCurrentPosition(): void {
    this.goBack();
    this.currentPosition.next.length = 0;
  }

  playMove(move: Move): this {
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

  playMoveWithPoints(srcX: number, srcY: number, destX: number, destY: number, promotionInitial?: string): this {
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
      const points = JSON.stringify({ srcX, srcY, destX, destY });
      throw new Error(`Illegal move ${points} in ${this.currentPosition.toFEN()}.`);
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

    if (!move)
      throw new Error(`Illegal move: "${notation}" in ${this.currentPosition.toFEN()}.`);

    return this.playMove(move);
  }

  playNullMove(): this {
    return this.playMove(NullMove.instance);
  }

  getInfoAsString(): string {
    return Object.entries(this.info)
      .map(([key, value]) => `[${key} "${value}"]`)
      .join("\n");
  }

  toPGN(): string {
    return `${this.getInfoAsString()}\n\n${this.firstPosition.toMoveString()} ${this.info.Result}`;
  }

  toString(): string {
    return this.toPGN();
  }
}