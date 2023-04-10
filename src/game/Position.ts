import GameStatus from "@src/constants/GameStatus.js";
import Colors, { Color, reverseColor } from "@src/constants/Colors.js";
import { Coordinates, coordsToNotation, getCoords } from "@src/constants/Coords.js";
import Piece from "@src/constants/Piece.js";
import { CastledKingFiles } from "@src/constants/placement.js";
import { attackedCoords, canCastleTo, pseudoLegalMoves } from "@src/moves/moves.js";
import { parseFen, stringifyBoard, stringifyCastlingRights } from "@src/pgn-fen/fen.js";
import { CastlingRights, HalfMove, HalfMoveWithPromotion, PieceMap, PositionInfo, Wing } from "@src/types.js";

export default class Position implements PositionInfo {
  public static readonly startFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  public static fromFen(fen: string): Position {
    return new this(parseFen(fen));
  }

  public readonly pieces: Record<Color, PieceMap>;
  public readonly kingCoords: Record<Color, Coordinates>;
  public readonly activeColor: Color;
  public readonly castlingRights: CastlingRights;
  public readonly enPassantCoords: Coordinates | null;
  public readonly halfMoveClock: number;
  public readonly fullMoveNumber: number;
  private readonly halfMoves: HalfMove[];
  /**
   * Used when checking for a triple repetition.
   */
  private readonly boardStr: string;
  public srcMove: HalfMoveWithPromotion | null = null;
  public prev: Position | null = null;
  public next: Position[] = [];

  constructor({ pieces, kingCoords, activeColor, castlingRights, enPassantCoords, halfMoveClock, fullMoveNumber }: PositionInfo) {
    this.pieces = pieces;
    this.kingCoords = kingCoords;
    this.activeColor = activeColor;
    this.castlingRights = castlingRights;
    this.enPassantCoords = enPassantCoords;
    this.halfMoveClock = halfMoveClock;
    this.fullMoveNumber = fullMoveNumber;
    this.halfMoves = this.computeHalfMoves();
    this.boardStr = stringifyBoard(this.pieces);
  }

  public get inactiveColor(): Color {
    return reverseColor(this.activeColor);
  }

  private computeHalfMoves(): HalfMove[] {
    const moves = [...this.pieces[this.activeColor].keys()].reduce((acc, srcCoords) => {
      for (const destCoords of pseudoLegalMoves(srcCoords, this.activeColor, this.pieces, this.enPassantCoords))
        if (!this.doesMoveCauseCheck(srcCoords, destCoords))
          acc.push([srcCoords, destCoords]);
      return acc;
    }, [] as HalfMove[]);

    const coordsAttackedByInactiveColor = this.getCoordsAttackedByColor(this.inactiveColor);
    const kingCoords = this.kingCoords[this.activeColor];

    if (coordsAttackedByInactiveColor.has(kingCoords))
      return moves;

    for (const rookY of this.castlingRights[this.activeColor]) {
      if (canCastleTo(rookY, this.activeColor, coordsAttackedByInactiveColor, this))
        moves.push([
          kingCoords,
          // TODO: update for 960
          getCoords(kingCoords.x, CastledKingFiles[Math.sign(rookY - kingCoords.y) as Wing])
        ]);
    }

    return moves;
  }

  public getHalfMoves(): HalfMove[] {
    return this.halfMoves;
  }

  private getCoordsAttackedByColor(color: Color): Set<Coordinates> {
    const set = new Set<Coordinates>();

    for (const srcCoords of this.pieces[color].keys())
      for (const destCoords of attackedCoords(srcCoords, color, this.pieces))
        set.add(destCoords);

    return set;
  }

  public isCheck(): boolean {
    const kingCoords = this.kingCoords[this.activeColor];

    for (const srcCoords of this.pieces[this.inactiveColor].keys())
      for (const destCoords of attackedCoords(srcCoords, this.inactiveColor, this.pieces))
        if (destCoords === kingCoords)
          return true;

    return false;
  }

  public getStatus(): GameStatus {
    if (!this.halfMoves.length)
      return (this.isCheck()) ? GameStatus.CHECKMATE : GameStatus.STALEMATE;
    if (this.halfMoveClock >= 50)
      return GameStatus.DRAW_BY_FIFTY_MOVE_RULE;
    if (this.isTripleRepetition())
      return GameStatus.TRIPLE_REPETITION;
    return GameStatus.ONGOING;
  }

  public isTripleRepetition(): boolean {
    let pos: Position | null | undefined = this.prev?.prev;
    let count = 0;

    while (pos && count < 3) {
      if (pos.boardStr === this.boardStr)
        count++;
      pos = pos.prev?.prev;
    }

    return count === 3;
  }

  private doesMoveCauseCheck(srcCoords: Coordinates, destCoords: Coordinates): boolean {
    const srcPiece = this.pieces[this.activeColor].get(srcCoords) as Piece;
    const capturedCoords = (srcPiece < Piece.KNIGHT && destCoords === this.enPassantCoords)
      ? getCoords(srcCoords.x, destCoords.y)
      : destCoords;
    const capturedPiece = this.pieces[this.inactiveColor].get(capturedCoords);

    this.pieces[this.activeColor].set(destCoords, srcPiece).delete(srcCoords);
    (srcPiece === Piece.KING) && (this.kingCoords[this.activeColor] = destCoords);
    capturedPiece && this.pieces[this.inactiveColor].delete(capturedCoords);

    const isCheck = this.isCheck();

    this.pieces[this.activeColor].set(srcCoords, srcPiece).delete(destCoords);
    (srcPiece === Piece.KING) && (this.kingCoords[this.activeColor] = srcCoords);
    capturedPiece && this.pieces[this.inactiveColor].set(capturedCoords, capturedPiece);

    return isCheck;
  }

  public cloneInfo(): PositionInfo & { inactiveColor: Color; } {
    return {
      pieces: {
        [Colors.WHITE]: new Map([...this.pieces[Colors.WHITE]]),
        [Colors.BLACK]: new Map([...this.pieces[Colors.BLACK]])
      },
      kingCoords: { ...this.kingCoords },
      activeColor: this.activeColor,
      inactiveColor: this.inactiveColor,
      castlingRights: structuredClone(this.castlingRights),
      enPassantCoords: this.enPassantCoords,
      halfMoveClock: this.halfMoveClock,
      fullMoveNumber: this.fullMoveNumber
    };
  }

  public toString(): string {
    return [
      this.boardStr,
      (this.activeColor === Colors.WHITE) ? "w" : "b",
      stringifyCastlingRights(this.castlingRights),
      (this.enPassantCoords) ? coordsToNotation(this.enPassantCoords) : "-",
      String(this.halfMoveClock),
      String(this.fullMoveNumber)
    ].join(" ");
  }
}