import IllegalMoveError from "$src/errors/IllegalMoveError.js";
import Position from "$src/game/Position.js";
import type Move from "$src/moves/AbstractMove.js";
import NullMove from "$src/moves/NullMove.js";
import PawnMove from "$src/moves/PawnMove.js";
import RealMove from "$src/moves/RealMove.js";
import { findMove } from "$src/utils/move-helpers.js";
import { GameResults, PGNParser, type PGNify, type Variation } from "pgnify";

export default class ChessGame {
  public static fromPGN(pgn: string) {
    const parser = new PGNParser(pgn);
    const game = new this({ info: parser.headers });
    game._playMoves(parser.mainLine);
    return game;
  }

  public readonly info: PGNify.PGNHeaders;
  public currentPosition: Position;


  public constructor(params?: {
    info: PGNify.PGNHeaders;
    moveString?: string;
  }) {
    this.info = params?.info ?? {};
    this.info.Result ??= GameResults.NONE;
    this.currentPosition = Position.fromFEN(this.info.FEN ?? Position.START_FEN);

    if (params?.moveString) {
      const parser = new PGNParser(params.moveString);
      this._playMoves(parser.mainLine);
    }
  }

  public get firstPosition() {
    let position = this.currentPosition;
    while (position.prev)
      position = position.prev;
    return position;
  }

  public get lastPosition() {
    let position = this.currentPosition;
    while (position.next[0])
      position = position.next[0].position;
    return position;
  }

  public get currentResult(): PGNify.GameResult {
    const pos = this.currentPosition;

    if (pos.isCheckmate())
      return (pos.activeColor.isWhite())
        ? GameResults.BLACK_WIN
        : GameResults.WHITE_WIN;

    if (
      pos.isStalemate()
      || pos.isInsufficientMaterial()
      || pos.halfMoveClock >= 50
      || this.isTripleRepetition()
    )
      return GameResults.DRAW;

    return GameResults.NONE;
  }

  public isTripleRepetition() {
    const { board } = this.currentPosition;
    let count = 1;
    let node = this.currentPosition.prev?.prev;

    while (node && count < 3) {
      if (node.board.pieceCount !== board.pieceCount)
        break;

      let isSameBoard = true;

      for (const [index, piece] of node.board.getEntries()) {
        if (board.get(index) !== piece) {
          isSameBoard = false;
          break;
        }
      }

      if (isSameBoard) count++;
      node = node.prev?.prev;
    }

    return count === 3;
  }

  public goBack() {
    if (this.currentPosition.prev)
      this.currentPosition = this.currentPosition.prev;
  }

  public goToStart() {
    this.currentPosition = this.firstPosition;
  }

  public goForward() {
    if (this.currentPosition.next[0])
      this.currentPosition = this.currentPosition.next[0].position;
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
    nextPos.prev = pos;
    pos.next.push({ move, position: nextPos });
    this.currentPosition = nextPos;
    return this;
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

  protected _playMoves({ comment, nodes }: Variation) {
    if (comment)
      this.currentPosition.comment = comment;

    for (const { notation, NAG, comment, variations } of nodes) {
      const posBefore = this.currentPosition;
      const move = findMove(posBefore, notation);

      if (!move)
        throw new IllegalMoveError({
          message: `Illegal move "${notation}".`,
          position: this.currentPosition,
          notation
        });

      if (NAG) move.NAG = NAG;
      if (comment) move.comment = comment;
      this.playMove(move);

      if (variations) {
        const posAfter = this.currentPosition;
        variations.forEach((variation) => {
          this.currentPosition = posBefore;
          this._playMoves(variation);
        });
        this.currentPosition = posAfter;
      }
    }
  }
}