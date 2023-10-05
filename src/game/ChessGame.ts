import Color from "@/board/Color.ts";
import GameResults from "@/game/GameResults.ts";
import Position from "@/game/Position.ts";
import PawnMove from "@/moves/PawnMove.ts";
import { Coords, GameInfo, GameResult, Move } from "@/typings/types.ts";
import playMoves from "@/utils/play-moves.ts";

export default class ChessGame {
  // ===== ===== ===== ===== =====
  // STATIC PUBLIC
  // ===== ===== ===== ===== =====

  static parsePgn(pgn: string) {
    const headerRegexp = /^\[(?<key>\w+)\s+"(?<value>[^"]*)"\]/;
    let matchArray: RegExpMatchArray | null;
    const gameInfo: GameInfo = { Result: GameResults.NONE };

    while ((matchArray = pgn.match(headerRegexp))?.groups) {
      gameInfo[matchArray.groups["key"]] = matchArray.groups["value"];
      pgn = pgn.slice(matchArray[0].length).trimStart();
    }

    const result = pgn.match(/(\*|1\/2-1\/2|(0|1)-(0|1))$/)?.[0] as GameResult | undefined;

    if (result) {
      pgn = pgn.slice(0, -result.length);
      if (result !== gameInfo.Result)
        console.warn(`Result in move list ("${result}") differs from result in game info ("${gameInfo.Result}").`);
    }

    return {
      gameInfo,
      moveList: pgn
    };
  }

  // ===== ===== ===== ===== =====
  // PUBLIC
  // ===== ===== ===== ===== =====

  readonly info: GameInfo;
  #currentPosition: Position;
  #firstPosition: Position;

  constructor({ info, pgn }: {
    info?: GameInfo;
    pgn?: string;
  } = {}) {
    info ??= { Result: GameResults.NONE };
    this.info = info;
    let moveList: string | null = null;

    if (pgn) {
      const { gameInfo, moveList: ml } = ChessGame.parsePgn(pgn.trim());
      Object.assign(this.info, gameInfo);
      moveList = ml;
    }

    this.#currentPosition = Position.fromFEN(this.info.FEN ?? Position.START_FEN);
    this.#firstPosition = this.#currentPosition;
    if (moveList !== null) playMoves(moveList, this);
  }

  get currentPosition() {
    return this.#currentPosition;
  }

  set currentPosition(position: Position) {
    this.#currentPosition = position;
    if (!position.prev)
      this.#firstPosition = position;
  }

  get firstPosition() {
    return this.#firstPosition;
  }

  get currentResult() {
    const currentPosition = this.#currentPosition;

    if (currentPosition.isCheckmate()) {
      return (currentPosition.activeColor === Color.WHITE)
        ? GameResults.BLACK_WIN
        : GameResults.WHITE_WIN;
    }
    if (
      currentPosition.isStalemate()
      || currentPosition.isInsufficientMaterial()
      || currentPosition.isTripleRepetition()
      || currentPosition.halfMoveClock >= 50
    ) {
      return GameResults.DRAW;
    }
    return GameResults.NONE;
  }

  goBack() {
    if (this.currentPosition.prev)
      this.currentPosition = this.currentPosition.prev!;
  }

  goToStart() {
    this.currentPosition = this.#firstPosition;
  }

  goForward() {
    if (this.currentPosition.next[0])
      this.currentPosition = this.currentPosition.next[0];
  }

  goToEnd() {
    let pos = this.#currentPosition;
    while (pos.next[0]) pos = pos.next[0];
    this.currentPosition = pos;
  }

  truncatePreviousMoves() {
    this.#currentPosition.prev = null;
    this.#firstPosition = this.#currentPosition;
  }

  truncateNextMoves() {
    const { prev } = this.#currentPosition;
    if (!prev) return;
    prev.next.length = 0;
    this.currentPosition = prev;
  }

  playMove(move: Move) {
    const pos = this.#currentPosition,
      board = pos.board.clone(),
      castlingRights = pos.castlingRights.clone(),
      srcPiece = board.get(move.srcCoords)!,
      destPiece = board.get(move.destCoords);

    if (srcPiece.isKing())
      castlingRights.get(pos.activeColor).clear();

    else if (srcPiece.isRook() && move.srcCoords.x === pos.activeColor.pieceRank)
      castlingRights.get(pos.activeColor).delete(move.srcCoords.y);

    if (destPiece?.isRook() && move.destCoords.x === pos.activeColor.opposite.pieceRank)
      castlingRights.get(pos.activeColor.opposite).delete(move.destCoords.y);

    move.try(board);

    this.currentPosition = this.#currentPosition.addNext({
      board,
      activeColor: pos.activeColor.opposite,
      castlingRights,
      enPassantCoords: move instanceof PawnMove && move.isDouble()
        ? move.srcCoords.peer(pos.activeColor.direction, 0)
        : null,
      halfMoveClock: (destPiece || srcPiece.isPawn()) ? 0 : (pos.halfMoveClock + 1),
      fullMoveNumber: pos.fullMoveNumber + Number(pos.activeColor === Color.BLACK),
      srcMove: move
    });
    return this;
  }

  playMoveWithCoords(srcCoords: Coords, destCoords: Coords) {
    const move = this.#currentPosition.legalMoves.find((move) => {
      return move.srcCoords === srcCoords
        && move.destCoords === destCoords;
    });

    if (!move)
      throw new Error(`Illegal move: ${JSON.stringify({ srcCoords: srcCoords.toJSON(), destCoords: destCoords.toJSON() })}.`);

    return this.playMove(move);
  }

  /**
   * @param notation A computer notation like "e2e4" or "a2a1Q".
   * @returns This same game.
   */
  playMoveWithNotation(notation: string): this {
    const move = this.#currentPosition.legalMoves.find((move) => {
      return move.computerNotation() === notation;
    });

    if (!move)
      throw new Error(`Illegal move: "${notation}".`);

    return this.playMove(move);
  }

  infoAsString() {
    const { Result, FEN: _FEN, ...info } = this.info;
    const infoAsStrings = Object.entries(info)
      .map(([key, value]) => `[${key} "${value}"]`)
      .concat(`[Result "${Result}"]`);
    const firstPositionFEN = this.#firstPosition.toFEN();

    if (firstPositionFEN !== Position.START_FEN)
      infoAsStrings.push(`[FEN "${firstPositionFEN}"]`);

    return infoAsStrings.join("\n");
  }

  moveListAsString() {
    return this.#firstPosition.toMoveList();
  }

  toPGN() {
    return `${this.infoAsString()}\n\n${this.moveListAsString()} ${this.info.Result}`;
  }

  toString() {
    return this.toPGN();
  }
}