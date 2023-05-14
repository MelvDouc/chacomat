import Colors, { Color } from "@src/constants/Colors.js";
import { Coordinates, Coords, coordsToNotation, getCoords } from "@src/constants/Coords.js";
import GameStatus, { GameResult, GameResults } from "@src/constants/GameStatus.js";
import Piece, { PromotedPiece } from "@src/constants/Piece.js";
import { CastledRookFiles, InitialPieceRanks } from "@src/constants/placement.js";
import Position from "@src/game/Position.js";
import { enterPgn, getPgnFromGame } from "@src/pgn-fen/pgn.js";
import { AlgebraicNotation, GameMetaInfo, PieceMap, Wing } from "@src/types.js";
import { Observable } from "melv_observable";

export default class ChessGame {
  private readonly currentPositionObs = new Observable<Position>();
  private readonly resultObs = new Observable<GameResult>();
  public readonly metaInfo: Partial<GameMetaInfo> = {};

  constructor({ pgn, fen }: {
    pgn?: string;
    fen?: string;
  } = { fen: Position.startFen }) {
    if (pgn) {
      const { gameMetaInfo, enterMoves } = enterPgn(pgn);
      this.metaInfo = gameMetaInfo;
      this.currentPositionObs.value = Position.fromFen(this.metaInfo.FEN ?? fen ?? Position.startFen);
      this.resultObs.value = this.metaInfo.Result ?? GameResults.ONGOING;
      enterMoves(this);
    } else {
      this.currentPositionObs.value = Position.fromFen(fen);
      this.metaInfo.FEN = fen;
      this.resultObs.value = GameResults.ONGOING;
    }
  }

  public get currentPosition(): Position {
    return this.currentPositionObs.value;
  }

  public get result(): GameResult {
    return this.resultObs.value;
  }

  public onPositionChange(subscription: (position: Position) => void): void {
    this.currentPositionObs.subscribe(subscription);
  }

  public onResultChange(subscription: (result: GameResult) => void): void {
    this.resultObs.subscribe(subscription);
  }

  public playMove(srcCoords: Coordinates, destCoords: Coordinates, promotedPiece?: PromotedPiece): this {
    const moves = this.currentPosition.getHalfMoves();

    if (!moves.some(([src, dest]) => src === srcCoords && dest === destCoords))
      throw new Error(`Illegal move: ${coordsToNotation(srcCoords)}-${coordsToNotation(destCoords)}`);

    const { pieces, castlingRights, activeColor, inactiveColor } = this.currentPosition.cloneInfo();
    let nextEnPassantCoords: Coordinates | null = null;
    const srcPiece = pieces[activeColor].get(srcCoords) as Piece;
    const destPiece = (srcPiece < Piece.KNIGHT || destCoords !== this.currentPosition.enPassantCoords)
      ? pieces[inactiveColor].get(destCoords)
      : pieces[inactiveColor].get(getCoords(srcCoords.x, destCoords.y));

    if (srcPiece === Piece.ROOK && srcCoords.x === InitialPieceRanks[activeColor])
      castlingRights[activeColor].delete(srcCoords.y);

    // unset castling rights on rook capture
    if (destPiece === Piece.ROOK && destCoords.x === InitialPieceRanks[inactiveColor])
      castlingRights[inactiveColor].delete(destCoords.y);

    if (srcPiece === Piece.KING) {
      if (this.isCastling(srcCoords, destCoords, pieces[activeColor]))
        this.castleRook(srcCoords, destCoords, pieces[activeColor], castlingRights[activeColor]);

      castlingRights[activeColor].clear();
    }

    // Here because the next condition may update `pieces[activeColor]`.
    pieces[activeColor].set(destCoords, srcPiece).delete(srcCoords);
    pieces[inactiveColor].delete(destCoords);

    if (srcPiece < Piece.KNIGHT) {
      if (Math.abs(destCoords.x - srcCoords.x) === 2)
        nextEnPassantCoords = getCoords((srcCoords.x + destCoords.x) / 2, srcCoords.y);
      else if (destCoords.x === InitialPieceRanks[inactiveColor])
        pieces[activeColor].set(destCoords, promotedPiece);
    }

    const nextPosition = new Position({
      pieces,
      castlingRights,
      activeColor: inactiveColor,
      enPassantCoords: nextEnPassantCoords,
      halfMoveClock: (srcPiece < Piece.KNIGHT || destPiece !== undefined) ? 0 : this.currentPosition.halfMoveClock + 1,
      fullMoveNumber: this.currentPosition.fullMoveNumber + Number(inactiveColor === Colors.WHITE)
    });

    this.checkStatus(nextPosition.getStatus(), activeColor);
    nextPosition.srcMove = [srcCoords, destCoords, promotedPiece];
    nextPosition.prev = this.currentPosition;
    this.currentPosition.next.push(nextPosition);
    this.currentPositionObs.value = nextPosition;
    return this;
  }

  public playMoveWithNotations(srcNotation: AlgebraicNotation, destNotation: AlgebraicNotation, promotedPiece?: PromotedPiece): this {
    return this.playMove(Coords[srcNotation], Coords[destNotation], promotedPiece);
  }

  private checkStatus(status: GameStatus, activeColor: Color): void {
    switch (status) {
      case GameStatus.CHECKMATE:
        this.resultObs.value = (activeColor === Colors.WHITE) ? GameResults.WHITE_WIN : GameResults.BLACK_WIN;
        break;
      case GameStatus.STALEMATE:
      case GameStatus.TRIPLE_REPETITION:
      case GameStatus.DRAW_BY_FIFTY_MOVE_RULE:
        this.resultObs.value = GameResults.DRAW;
        break;
    }
  }

  private isCastling(srcCoords: Coordinates, destCoords: Coordinates, pieceMap: PieceMap): boolean {
    return Math.abs(srcCoords.y - destCoords.y) === 2 || pieceMap.get(destCoords) === Piece.ROOK;
  }

  private castleRook(srcCoords: Coordinates, destCoords: Coordinates, pieceMap: PieceMap, castlingRights: Set<number>): void {
    const wing = Math.sign(destCoords.y - srcCoords.y) as Wing;
    const rookY = [...castlingRights].find((y) => Math.sign(y - srcCoords.y) === wing) as number;
    pieceMap.delete(getCoords(srcCoords.x, rookY));
    pieceMap.set(getCoords(srcCoords.x, CastledRookFiles[wing]), Piece.ROOK);
  }

  /**
   * End the game by resignation.
   * @param color The camp that resigns.
   */
  public resign(color: Color): void {
    this.resultObs.value = (color === Colors.WHITE) ? GameResults.WHITE_WIN : GameResults.BLACK_WIN;
    this.metaInfo.Termination = "resignation";
  }

  public getFirstPosition(): Position {
    let pos: Position | null | undefined = this.currentPosition;

    while (pos.prev)
      pos = pos.prev;

    return pos;
  }

  public goToMove(moveNumber: number, color: Color): void {
    let pos: Position | null | undefined = this.currentPosition;

    while (pos && pos.fullMoveNumber !== moveNumber) {
      pos = (pos.fullMoveNumber < moveNumber)
        ? pos.next[0]
        : pos.prev;
    }

    if (!pos)
      throw new Error(`No position was found at move number ${moveNumber}.`);

    if (pos.activeColor === color) {
      this.currentPositionObs.value = pos;
      return;
    }

    const otherPos = (color === Colors.WHITE) ? pos.next[0] : pos.prev;

    if (!otherPos)
      throw new Error(`No position was found at move number ${moveNumber} for color ${color}.`);

    this.currentPositionObs.value = otherPos;
  }

  public toString(): string {
    return getPgnFromGame(this);
  }
}