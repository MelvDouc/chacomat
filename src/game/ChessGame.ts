import Position from "$src/game/Position.js";
import PositionTree from "$src/game/PositionTree.js";
import type Move from "$src/moves/AbstractMove.js";
import NullMove from "$src/moves/NullMove.js";
import PawnMove from "$src/moves/PawnMove.js";
import RealMove from "$src/moves/RealMove.js";
import playMoves from "$src/utils/play-moves.js";
import { GameResults, PGNParser, type GameResult, type PGNHeaders } from "pgnify";

export default class ChessGame {
  public static fromPGN(pgn: string) {
    const parser = new PGNParser(pgn);
    const game = new this({ info: parser.headers });
    playMoves(game, parser.mainLine);
    return game;
  }

  public readonly info: PGNHeaders;
  public tree: PositionTree;

  public constructor(params?: {
    info: PGNHeaders;
    moveString?: string;
  }) {
    this.info = params?.info ?? {};
    this.info.Result ??= GameResults.NONE;
    const position = Position.fromFEN(this.info.FEN ?? Position.START_FEN);
    this.tree = new PositionTree(position);

    if (params?.moveString) {
      const parser = new PGNParser(params.moveString);
      playMoves(this, parser.mainLine);
    }
  }

  public get currentPosition() {
    return this.tree.position;
  }

  public get firstPosition() {
    return this.tree.root.position;
  }

  public get lastPosition() {
    return this.tree.endOfVariation.position;
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
      || this.isTripleRepetition()
      || pos.halfMoveClock >= 50
    )
      return GameResults.DRAW;

    return GameResults.NONE;
  }

  public isTripleRepetition() {
    const { board } = this.currentPosition;
    let count = 1;
    let tree = this.tree.prev?.prev;

    while (tree && count < 3) {
      if (tree.position.board.pieceCount !== board.pieceCount)
        break;

      let isSameBoard = true;

      for (const [index, piece] of tree.position.board.getEntries()) {
        if (board.get(index) !== piece) {
          isSameBoard = false;
          break;
        }
      }

      if (isSameBoard) count++;
      tree = tree.prev?.prev;
    }

    return count === 3;
  }

  public goBack() {
    if (this.tree.prev)
      this.tree = this.tree.prev;
  }

  public goToStart() {
    this.tree = this.tree.root;
  }

  public goForward() {
    if (this.tree.hasMainLine())
      this.tree = this.tree.mainLine.tree;
  }

  public goToEnd() {
    this.tree = this.tree.endOfVariation;
  }

  public truncatePreviousMoves() {
    this.tree.prev = null;

    if (this.currentPosition.fullMoveNumber !== 1 || !this.currentPosition.activeColor.isWhite())
      this.info.FEN = this.currentPosition.toFEN();
  }

  public truncateFromCurrentPosition() {
    this.goBack();
    this.tree.clearNext();
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
    this.tree = this.tree.addNext(nextPos, move);
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
    return `${this.getInfoAsString()}\n\n${this.tree.root.toMoveString()} ${this.info.Result}`;
  }

  public toString() {
    return this.toPGN();
  }
}