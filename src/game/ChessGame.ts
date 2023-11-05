import { coords } from "@/coordinates/Coords.ts";
import GameResults from "@/game/GameResults.ts";
import Position from "@/game/Position.ts";
import PawnMove from "@/moves/PawnMove.ts";
import { ChacoMat } from "@/typings/chacomat.ts";
import playMoves from "@/utils/play-moves.ts";

export default class ChessGame {
  // ===== ===== ===== ===== =====
  // STATIC PUBLIC
  // ===== ===== ===== ===== =====

  static parsePGN(pgn: string) {
    pgn = pgn.trim();
    const gameInfo = Object.create(null) as ChacoMat.GameInfo;
    const headerRegex = /^\[(?<key>[^"\s]+)\s+"(?<value>[^"]*)"\]*\s*/;
    let matchArr: RegExpMatchArray | null;

    while ((matchArr = pgn.match(headerRegex)) !== null) {
      gameInfo[matchArr.groups!.key] = matchArr.groups!.value;
      pgn = pgn.slice(matchArr[0].length).trimStart();
    }

    const result = pgn.match(/(\*|1\/2-1\/2|[01]-[01])$/)?.[0] as ChacoMat.GameResult | undefined;

    if (!gameInfo.Result)
      console.warn("Result missing from headers.");

    if (!result)
      console.warn("Result missing from move list.");

    if (gameInfo.Result && result && gameInfo.Result !== result)
      console.warn(`Result in headers ("${gameInfo.Result}") differs from result in move list ("${result}"). Using one in headers.`);

    gameInfo.Result ??= (result ?? GameResults.NONE);
    return {
      gameInfo,
      moveString: pgn
    };
  }

  // ===== ===== ===== ===== =====
  // PUBLIC
  // ===== ===== ===== ===== =====

  readonly info: ChacoMat.GameInfo;
  #currentPosition: ChacoMat.Position;

  constructor();
  constructor(pgn: string);
  constructor({ info, moveString }: { info: ChacoMat.GameInfo; moveString: string; });

  constructor(param?: string | { info: ChacoMat.GameInfo; moveString: string; }) {
    switch (typeof param) {
      case "string": {
        const { gameInfo, moveString } = ChessGame.parsePGN(param);
        this.info = gameInfo;
        this.#currentPosition = Position.fromFEN(this.info.FEN ?? Position.START_FEN);
        playMoves(moveString, this);
        break;
      }
      case "undefined": {
        this.info = { Result: GameResults.NONE };
        this.#currentPosition = Position.fromFEN(Position.START_FEN);
        break;
      }
      case "object": {
        if (param === null)
          throw new Error("Null parameter not accepted.");
        const { info, moveString } = param;
        this.info = info;
        this.#currentPosition = Position.fromFEN(this.info.FEN ?? Position.START_FEN);
        playMoves(moveString, this);
        break;
      }
    }
  }

  get currentPosition() {
    return this.#currentPosition;
  }

  set currentPosition(position: ChacoMat.Position) {
    this.#currentPosition = position;
  }

  get firstPosition() {
    let pos = this.#currentPosition;
    while (pos.prev) pos = pos.prev;
    return pos;
  }

  get lastPosition() {
    let pos = this.#currentPosition;
    while (pos.next[0]) pos = pos.next[0];
    return pos;
  }

  get currentResult() {
    const pos = this.#currentPosition;

    if (pos.isCheckmate()) {
      return (pos.activeColor.isWhite())
        ? GameResults.BLACK_WIN
        : GameResults.WHITE_WIN;
    }
    if (
      pos.isStalemate()
      || pos.isInsufficientMaterial()
      || pos.isTripleRepetition()
      || pos.halfMoveClock >= 50
    ) {
      return GameResults.DRAW;
    }
    return GameResults.NONE;
  }

  goBack() {
    if (this.#currentPosition.prev)
      this.#currentPosition = this.#currentPosition.prev;
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
    const fen = this.#currentPosition.toFEN();
    if (fen !== Position.START_FEN)
      this.info.FEN = fen;
  }

  truncateFromCurrentPosition() {
    this.goBack();
    this.#currentPosition.next.length = 0;
  }

  playMove(move: ChacoMat.Move) {
    const pos = this.#currentPosition,
      board = pos.board.clone(),
      castlingRights = pos.castlingRights.clone();

    this.#updateCastlingRights(castlingRights, move);
    move.play(board);

    const nextPos = new Position(
      board,
      pos.activeColor.opposite,
      castlingRights,
      move instanceof PawnMove && move.isDouble()
        ? coords[move.srcCoords.x][move.srcCoords.y + pos.activeColor.direction]
        : null,
      (move.capturedPiece || move.srcPiece.isPawn()) ? 0 : (pos.halfMoveClock + 1),
      pos.fullMoveNumber + Number(!pos.activeColor.isWhite())
    );
    nextPos.srcMove = move;
    nextPos.prev = this.#currentPosition;
    this.#currentPosition.next.push(nextPos);
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

  playNullMove() {
    const pos = this.#currentPosition;
    const nextPos = new Position(
      pos.board.clone(),
      pos.activeColor.opposite,
      pos.castlingRights.clone(),
      pos.enPassantCoords,
      pos.halfMoveClock,
      pos.fullMoveNumber + Number(!pos.activeColor.isWhite())
    );
    nextPos.prev = pos;
    pos.next.push(nextPos);
    this.#currentPosition = nextPos;
    return this;
  }

  infoAsString() {
    return Object.entries(this.info)
      .map(([key, value]) => `[${key} "${value}"]`)
      .join("\n");
  }

  toPGN() {
    const tree = this.firstPosition.toTree();
    const moveStr = (tree ? `${tree.toString()} ` : "") + this.info.Result;
    return `${this.infoAsString()}\n\n${moveStr}`;
  }

  toString() {
    return this.toPGN();
  }

  #updateCastlingRights(castlingRights: ChacoMat.CastlingRights, { srcCoords, destCoords, srcPiece, capturedPiece }: ChacoMat.Move) {
    if (srcPiece.isKing())
      castlingRights.get(srcPiece.color).clear();

    else if (srcPiece.isRook() && srcCoords.y === srcPiece.color.pieceRank)
      castlingRights.get(srcPiece.color).delete(srcCoords.x);

    if (capturedPiece?.isRook() && destCoords.y === capturedPiece.color.pieceRank)
      castlingRights.get(capturedPiece.color).delete(destCoords.x);
  }
}