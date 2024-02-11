import Position from "$src/game/Position.js";
import CastlingMove from "$src/moves/CastlingMove.js";
import type Move from "$src/moves/Move.js";
import NullMove from "$src/moves/NullMove.js";
import PawnMove from "$src/moves/PawnMove.js";
import RegularMove from "$src/moves/RegularMove.js";
import { IllegalMoveError } from "$src/utils/errors.js";
import { findMove } from "$src/utils/move-helpers.js";
import { GameResults, getTokens, parse, parseMoves, type PGNify } from "pgnify";

export default class ChessGame {
  public static fromPGN(pgn: string) {
    const { headers, mainLine } = parse(pgn);
    const game = new this({ info: headers });
    game._playMoves(mainLine);
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
      this._playMoves(parseMoves(getTokens(params.moveString)));
    }
  }

  public get firstPosition() {
    return this.currentPosition.root;
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
      || pos.isTripleRepetition()
      || pos.halfMoveClock >= 50
    )
      return GameResults.DRAW;

    return GameResults.NONE;
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
    const isRegularMove = move instanceof RegularMove;

    move.play(board);

    if (isRegularMove) {
      castlingRights.update(move.srcPiece, move.capturedPiece, move.srcPoint, move.destPoint);
    } else if (move instanceof CastlingMove) {
      const rights = castlingRights.get(move.king.color);
      rights.kingSide = false;
      rights.queenSide = false;
    }

    const nextPos = new Position({
      board,
      activeColor: pos.inactiveColor,
      castlingRights,
      enPassantIndex: move instanceof PawnMove && move.isDouble()
        ? (move.srcIndex + move.destIndex) / 2
        : null,
      halfMoveClock: isRegularMove && (move.isCapture() || move.srcPiece.isPawn())
        ? 0
        : (pos.halfMoveClock + 1),
      fullMoveNumber: pos.fullMoveNumber + Number(!pos.activeColor.isWhite())
    });
    nextPos.prev = pos;
    pos.next.push({ move, position: nextPos });
    this.currentPosition = nextPos;
    return this;
  }

  public playNullMove() {
    return this.playMove(new NullMove());
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

  protected _playMoves({ comment, nodes }: PGNify.Variation) {
    let commentBefore = comment;

    for (const { notation, NAG, comment, variations } of nodes) {
      const posBefore = this.currentPosition;
      const move = findMove(posBefore, notation);

      if (!move)
        throw new IllegalMoveError(`Illegal move: "${notation}".`, {
          cause: {
            notation,
            position: posBefore
          }
        });

      if (commentBefore) {
        move.commentBefore = commentBefore;
        commentBefore = undefined;
      }

      if (NAG) move.NAG = NAG;
      if (comment) move.commentAfter = comment;

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