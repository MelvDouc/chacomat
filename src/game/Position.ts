import Colors, { ReversedColors } from "@src/constants/Colors.js";
import {
  Coords,
  coordsToNotation,
  getCoords
} from "@src/constants/Coords.js";
import GameStatus from "@src/constants/GameStatus.js";
import Piece from "@src/constants/Piece.js";
import { CastledKingFiles, CastlingFilesByColorAndWing } from "@src/constants/placement.js";
import Board from "@src/game/Board.js";
import { canCastleTo } from "@src/moves/legal-moves.js";
import { isValidFen } from "@src/pgn-fen/fen.js";
import { halfMoveToNotation } from "@src/pgn-fen/half-move.js";
import {
  AlgebraicNotation,
  CastlingRights,
  Color,
  Coordinates,
  HalfMove,
  Wing
} from "@src/types.js";


export default class Position {
  public static readonly startFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  public static fromFen(fen: string): Position {
    if (!isValidFen(fen))
      throw new Error(`Invalid FEN string: "${fen}"`);

    const [boardStr, color, castlingStr, enPassant, halfMoveClock, fullMoveNumber] = fen.split(" ");

    return new this({
      board: new Board(boardStr),
      activeColor: (color === "w") ? Colors.WHITE : Colors.BLACK,
      castlingRights: this.parseCastlingRights(castlingStr),
      enPassantCoords: Coords[enPassant as AlgebraicNotation] ?? null,
      halfMoveClock: +halfMoveClock,
      fullMoveNumber: +fullMoveNumber
    });
  }

  protected static parseCastlingRights(castlingStr: string): CastlingRights {
    return [...CastlingFilesByColorAndWing].reduce((acc, [color, filesByWing]) => {
      for (const key in filesByWing)
        if (castlingStr.includes(key))
          acc[color].add(filesByWing[key]);
      return acc;
    }, {
      [Colors.WHITE]: new Set<number>(),
      [Colors.BLACK]: new Set<number>()
    });
  }

  protected static stringifyCastlingRights(castlingRights: CastlingRights): string {
    return [...CastlingFilesByColorAndWing].reduce((acc, [color, filesByWing]) => {
      for (const key in filesByWing)
        if (castlingRights[color].has(filesByWing[key]))
          acc += key;
      return acc;
    }, "") || "-";
  }

  public readonly board: Board;
  public readonly activeColor: Color;
  /** Contains initial rook files. */
  public readonly castlingRights: CastlingRights;
  public readonly enPassantCoords: Coordinates | null;
  public readonly halfMoveClock: number;
  public readonly fullMoveNumber: number;
  public readonly legalMoves: HalfMove[];
  public prev?: Position;
  public next: {
    notation: string;
    position: Position;
  }[] = [];

  constructor({ board, activeColor, castlingRights, enPassantCoords, halfMoveClock, fullMoveNumber }: {
    board: Board;
    activeColor: Color;
    castlingRights: CastlingRights;
    enPassantCoords: Coordinates | null;
    halfMoveClock: number;
    fullMoveNumber: number;
  }) {
    this.board = board;
    this.activeColor = activeColor;
    this.castlingRights = castlingRights;
    this.enPassantCoords = enPassantCoords;
    this.halfMoveClock = halfMoveClock;
    this.fullMoveNumber = fullMoveNumber;
    this.legalMoves = this.computeLegalMoves();
  }

  public get inactiveColor(): Color {
    return ReversedColors[this.activeColor];
  }

  public get legalMovesAsNotations(): string[] {
    return this.legalMoves.map((move) => halfMoveToNotation(this, move));
  }

  public get status(): GameStatus {
    if (!this.legalMoves.length)
      return (this.isCheck()) ? GameStatus.CHECKMATE : GameStatus.STALEMATE;
    if (this.halfMoveClock >= 50)
      return GameStatus.DRAW_BY_FIFTY_MOVE_RULE;
    if (this.board.isInsufficientMaterial())
      return GameStatus.INSUFFICIENT_MATERIAL;
    if (this.isTripleRepetition())
      return GameStatus.TRIPLE_REPETITION;
    return GameStatus.ONGOING;
  }

  protected computeLegalMoves(): HalfMove[] {
    const moves = [...this.board.pseudoLegalMoves(this.activeColor, this.enPassantCoords)].filter(([srcCoords, destCoords]) => {
      return !this.doesMoveCauseCheck(srcCoords, destCoords);
    });

    const coordsAttackedByInactiveColor = this.board.getCoordsAttackedByColor(this.inactiveColor);
    const kingCoords = this.board.getKingCoords(this.activeColor);

    if (!coordsAttackedByInactiveColor.has(kingCoords)) {
      for (const rookY of this.castlingRights[this.activeColor]) {
        if (canCastleTo(rookY, this.activeColor, this.board, coordsAttackedByInactiveColor))
          moves.push(this.getCastlingMove(kingCoords, rookY));
      }
    }

    return moves;
  }

  protected getCastlingMove(kingCoords: Coordinates, rookY: number): HalfMove {
    return [
      kingCoords,
      getCoords(kingCoords.x, CastledKingFiles[Math.sign(rookY - kingCoords.y) as Wing])
    ];
  }

  public isCastlingMove(srcCoords: Coordinates, destCoords: Coordinates): boolean {
    return this.board.get(this.activeColor, srcCoords) === Piece.KING
      && Math.abs(destCoords.y - srcCoords.y) === 2;
  }

  public isLegal(): boolean {
    if (this.board
      .getCoordsAttackedByColor(this.activeColor)
      .has(this.board.getKingCoords(this.inactiveColor)))
      return false;

    // TODO: check other conditions

    return true;
  }

  public isCheck(): boolean {
    return this
      .board
      .getCoordsAttackedByColor(this.inactiveColor)
      .has(this.board.getKingCoords(this.activeColor));
  }

  public isTripleRepetition(): boolean {
    const boardStr = this.board.toString();
    let count = 0;

    for (
      let pos: Position | undefined = this.prev?.prev;
      pos && count < 3;
      pos = pos.prev?.prev
    ) {
      if (pos.board.toString() === boardStr)
        count++;
    }

    return count === 3;
  }

  protected doesMoveCauseCheck(srcCoords: Coordinates, destCoords: Coordinates): boolean {
    const srcPiece = this.board.get(this.activeColor, srcCoords) as Piece;
    const captureCoords = (srcPiece >= Piece.KNIGHT || destCoords !== this.enPassantCoords)
      ? destCoords
      : getCoords(srcCoords.x, destCoords.y);
    const capturedPiece = this.board.get(this.inactiveColor, captureCoords);

    this.board.set(this.activeColor, destCoords, srcPiece).delete(this.activeColor, srcCoords);
    capturedPiece && this.board.delete(this.inactiveColor, captureCoords);

    const isCheck = this.isCheck();

    this.board.set(this.activeColor, srcCoords, srcPiece).delete(this.activeColor, destCoords);
    capturedPiece && this.board.set(this.inactiveColor, captureCoords, capturedPiece);

    return isCheck;
  }

  public toString(): string {
    return [
      this.board.toString(),
      (this.activeColor === Colors.WHITE) ? "w" : "b",
      (this.constructor as typeof Position).stringifyCastlingRights(this.castlingRights),
      (this.enPassantCoords) ? coordsToNotation(this.enPassantCoords) : "-",
      String(this.halfMoveClock),
      String(this.fullMoveNumber)
    ].join(" ");
  }
}