import Color from "@/board/Color.ts";
import GameResults from "@/game/GameResults.ts";
import Position from "@/game/Position.ts";
import PawnMove from "@/moves/PawnMove.ts";
import { ChacoMat } from "@/typings/chacomat.ts";
import playMoves from "@/utils/play-moves.ts";

export default class ChessGame {
  // ===== ===== ===== ===== =====
  // STATIC PUBLIC
  // ===== ===== ===== ===== =====

  static parsePgn(pgn: string) {
    const headerRegexp = /^\[(?<key>\w+)\s+"(?<value>[^"]*)"\]/;
    let matchArray: RegExpMatchArray | null;
    const gameInfo: ChacoMat.GameInfo = { Result: GameResults.NONE };

    while ((matchArray = pgn.match(headerRegexp))?.groups) {
      gameInfo[matchArray.groups["key"]] = matchArray.groups["value"];
      pgn = pgn.slice(matchArray[0].length).trimStart();
    }

    const result = pgn.match(/(\*|1\/2-1\/2|(0|1)-(0|1))$/)?.[0] as ChacoMat.GameResult | undefined;

    if (result) {
      pgn = pgn.slice(0, -result.length);
      if (result !== gameInfo.Result)
        console.warn(`Result in move list ("${result}") differs from result in game info ("${gameInfo.Result}").`);
    }

    return {
      gameInfo,
      moveStr: pgn
    };
  }

  // ===== ===== ===== ===== =====
  // PUBLIC
  // ===== ===== ===== ===== =====

  readonly info: ChacoMat.GameInfo;
  #currentPosition: Position;

  constructor();
  constructor(pgn: string);
  constructor(info: ChacoMat.GameInfo);

  constructor(param?: string | ChacoMat.GameInfo) {
    if (typeof param === "string") {
      const { gameInfo, moveStr } = ChessGame.parsePgn(param.trim());
      this.info = gameInfo;
      this.#currentPosition = Position.fromFEN(this.info.FEN ?? Position.START_FEN);
      playMoves(moveStr, this);
    } else if (typeof param === "object" && param !== null && "Result" in param) {
      this.info = param;
      this.#currentPosition = Position.fromFEN(this.info.FEN ?? Position.START_FEN);
    } else {
      this.info = { Result: GameResults.NONE };
      this.#currentPosition = Position.fromFEN(Position.START_FEN);
    }
  }

  get currentPosition() {
    return this.#currentPosition;
  }

  set currentPosition(position: Position) {
    this.#currentPosition = position;
  }

  get firstPosition() {
    let pos = this.#currentPosition;
    while (pos.prev) pos = pos.prev;
    return pos;
  }

  get lastPosition() {
    let pos = this.#currentPosition;
    while (pos.next) pos = pos.next[0];
    return pos;
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
    if (this.#currentPosition.prev)
      this.#currentPosition = this.#currentPosition.prev!;
  }

  goToStart() {
    this.#currentPosition = this.firstPosition;
  }

  goForward() {
    if (this.#currentPosition.next[0])
      this.#currentPosition = this.#currentPosition.next[0];
  }

  goToEnd() {
    this.#currentPosition = this.lastPosition;
  }

  truncatePreviousMoves() {
    this.#currentPosition.prev = null;
  }

  truncateFromCurrentPosition() {
    this.goBack();
    this.#currentPosition.next.length = 0;
  }

  playMove(move: ChacoMat.Move) {
    const pos = this.#currentPosition,
      activeColor = pos.activeColor,
      board = pos.board.clone(),
      castlingRights = pos.castlingRights.clone(),
      srcPiece = board.get(move.srcCoords)!,
      destPiece = board.get(move.destCoords);

    if (srcPiece.isKing())
      castlingRights.get(activeColor).clear();

    else if (srcPiece.isRook() && move.srcCoords.y === board.getPieceRank(activeColor))
      castlingRights.get(activeColor).delete(move.srcCoords.x);

    if (destPiece?.isRook() && move.destCoords.y === board.getPieceRank(activeColor.opposite))
      castlingRights.get(activeColor.opposite).delete(move.destCoords.x);

    move.try(board);

    const nextPos = new Position({
      board,
      activeColor: activeColor.opposite,
      castlingRights,
      enPassantCoords: move instanceof PawnMove && move.isDouble()
        ? move.srcCoords.peer(0, activeColor.direction)
        : null,
      halfMoveClock: (destPiece || srcPiece.isPawn()) ? 0 : (pos.halfMoveClock + 1),
      fullMoveNumber: pos.fullMoveNumber + Number(activeColor === Color.BLACK)
    });
    nextPos.srcMove = move;
    nextPos.prev = pos;
    pos.next.push(nextPos);
    this.#currentPosition = nextPos;
    return this;
  }

  playMoveWithCoords(srcX: number, srcY: number, destX: number, destY: number, promotionInitial?: string) {
    const move = this.#currentPosition.legalMoves.find((m) => {
      return m.srcCoords.x === srcX
        && m.srcCoords.y === srcY
        && m.destCoords.x === destX
        && m.destCoords.y === destY
        && (!promotionInitial || m instanceof PawnMove && m.promotedPiece?.whiteInitial === promotionInitial);
    });

    if (!move)
      throw new Error(`Illegal move: ${JSON.stringify({ srcX, srcY, destX, destY })}.`);

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
    const firstPositionFEN = this.firstPosition.toFEN();

    if (firstPositionFEN !== Position.START_FEN)
      infoAsStrings.push(`[FEN "${firstPositionFEN}"]`);

    return infoAsStrings.join("\n");
  }

  toPGN() {
    return `${this.infoAsString()}\n\n${this.firstPosition.toMoveList().toString()} ${this.info.Result}`;
  }

  toString() {
    return this.toPGN();
  }
}