import Colors, { Color, reverseColor } from "@src/constants/Colors.js";
import {
  Coordinates,
  Coords,
  coordsToNotation,
  getCoords
} from "@src/constants/Coords.js";
import GameStatus from "@src/constants/GameStatus.js";
import Piece from "@src/constants/Piece.js";
import { CastledKingFiles } from "@src/constants/placement.js";
import PieceMap from "@src/game/PieceMap.js";
import { attackedCoords, canCastleTo, pseudoLegalMoves } from "@src/moves/moves.js";
import {
  getCastlingRights,
  getPieceMaps,
  isValidFen,
  stringifyBoard,
  stringifyCastlingRights
} from "@src/pgn-fen/fen.js";
import {
  AlgebraicNotation,
  CastlingRights,
  HalfMove,
  HalfMoveWithPromotion,
  PositionInfo,
  Wing
} from "@src/types.js";

export default class Position implements PositionInfo {
  public static readonly startFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  public static fromFen(fen: string): Position {
    if (!isValidFen(fen))
      throw new Error(`Invalid FEN string: "${fen}"`);

    const [pieceStr, color, castlingStr, enPassant, halfMoveClock, fullMoveNumber] = fen.split(" ");

    return new this({
      pieces: getPieceMaps(pieceStr),
      activeColor: (color === "w") ? Colors.WHITE : Colors.BLACK,
      castlingRights: getCastlingRights(castlingStr),
      enPassantCoords: Coords[enPassant as AlgebraicNotation] ?? null,
      halfMoveClock: +halfMoveClock,
      fullMoveNumber: +fullMoveNumber
    });
  }

  public readonly pieces: Record<Color, PieceMap>;
  public readonly activeColor: Color;
  public readonly castlingRights: CastlingRights;
  public readonly enPassantCoords: Coordinates | null;
  public readonly halfMoveClock: number;
  public readonly fullMoveNumber: number;
  private readonly halfMoves: HalfMove[];
  /** Used when checking for a triple repetition. */
  private readonly boardStr: string;
  public srcMove: HalfMoveWithPromotion | null = null;
  public prev: Position | null = null;
  public next: Position[] = [];
  protected readonly isChess960 = false;

  constructor({ pieces, activeColor, castlingRights, enPassantCoords, halfMoveClock, fullMoveNumber }: PositionInfo) {
    this.pieces = pieces;
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
    const { kingCoords } = this.pieces[this.activeColor];

    if (coordsAttackedByInactiveColor.has(kingCoords))
      return moves;

    for (const rookY of this.castlingRights[this.activeColor]) {
      if (canCastleTo(rookY, this.activeColor, coordsAttackedByInactiveColor, this))
        moves.push([
          kingCoords,
          this.isChess960
            ? getCoords(kingCoords.x, rookY)
            : getCoords(kingCoords.x, CastledKingFiles[Math.sign(rookY - kingCoords.y) as Wing])
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
    for (const srcCoords of this.pieces[this.inactiveColor].keys())
      for (const destCoords of attackedCoords(srcCoords, this.inactiveColor, this.pieces))
        if (destCoords === this.pieces[this.activeColor].kingCoords)
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
    capturedPiece && this.pieces[this.inactiveColor].delete(capturedCoords);

    const isCheck = this.isCheck();

    this.pieces[this.activeColor].set(srcCoords, srcPiece).delete(destCoords);
    capturedPiece && this.pieces[this.inactiveColor].set(capturedCoords, capturedPiece);

    return isCheck;
  }

  public cloneInfo(): PositionInfo & { inactiveColor: Color; } {
    return {
      pieces: {
        [Colors.WHITE]: this.pieces[Colors.WHITE].clone(),
        [Colors.BLACK]: this.pieces[Colors.BLACK].clone()
      },
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
      stringifyCastlingRights(this.castlingRights, this.isChess960),
      (this.enPassantCoords) ? coordsToNotation(this.enPassantCoords) : "-",
      String(this.halfMoveClock),
      String(this.fullMoveNumber)
    ].join(" ");
  }
}