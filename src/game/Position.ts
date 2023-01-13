import GameStatus from "../constants/GameStatus.js";
import Color from "../constants/Color.js";
import Wing from "../constants/Wing.js";
import Piece from "../pieces/Piece.js";
import Board from "./Board.js";
import CastlingRights from "./CastlingRights.js";
import type {
  AlgebraicSquareNotation,
  ChessGame,
  Coords,
  FenString,
  King,
  Move,
  Pawn,
  PositionInfo,
  PromotedPieceInitial,
  Rook
} from "../types.js";

/**
 * @classdesc An instance of this class is an immutable description of a position in a game. Its status cannot be altered.
 */
export default class Position implements PositionInfo {
  public static readonly startFenString: FenString = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  private static readonly colorAbbreviations = {
    w: Color.WHITE,
    b: Color.BLACK,
    [Color.WHITE]: "w",
    [Color.BLACK]: "b",
  };

  /**
   * Create a new position using only an FEN string.
   */
  public static fromFenString(fenString: FenString): Position {
    const [
      pieceString,
      color,
      castlingString,
      enPassant,
      halfMoveClock,
      fullMoveNumber,
    ] = fenString.split(" ");
    const board = Board.fromPieceString(pieceString);
    const position = new Position({
      board,
      castlingRights: CastlingRights.fromString(castlingString),
      colorToMove: Position.colorAbbreviations[color as keyof typeof Position.colorAbbreviations] as Color,
      enPassantFile: (enPassant === "-")
        ? -1
        : board.Coords.fromNotation(enPassant as AlgebraicSquareNotation)!.y,
      halfMoveClock: +halfMoveClock,
      fullMoveNumber: +fullMoveNumber
    });
    board.position = position;
    return position;
  }

  public readonly board: Board;
  public readonly castlingRights: CastlingRights;
  public readonly colorToMove: Color;
  public readonly enPassantFile: number;
  public readonly halfMoveClock: number;
  public readonly fullMoveNumber: number;
  private _legalMoves: Move[];
  private _attackedCoordsSet: Set<Coords>;
  public prev: Position | null = null;
  public next: Position[] = [];
  public game: ChessGame;

  constructor(positionInfo: PositionInfo) {
    Object.assign(this, positionInfo);
    this.board.position = this;
  }

  public get inactiveColor(): Color {
    return (this.colorToMove === Color.WHITE) ? Color.BLACK : Color.WHITE;
  }

  public get legalMoves(): Move[] {
    if (this._legalMoves)
      return this._legalMoves;

    const legalMoves: Move[] = [];

    for (const move of this.pseudoLegalMoves())
      if (!this.getPositionFromMove(move[0], move[1]).isCheck())
        legalMoves.push(move);

    if (!this.isCheck()) {
      const king = this.board.kings[this.colorToMove];
      for (const halfMove of king.castlingCoords())
        legalMoves.push([king.coords, halfMove]);
    }

    return (this._legalMoves = legalMoves);
  }

  /**
   * @returns A human-readable array of moves as strings following the pattern `e2-e4`.
   */
  public get legalMovesAsNotation(): string[] {
    return this.legalMoves.map(([srcCoords, destCoords]) => {
      return `${srcCoords.notation}-${destCoords.notation}`;
    });
  }

  public get attackedCoordsSet(): Set<Coords> {
    this._attackedCoordsSet ??= this.board.getCoordsAttackedByColor(this.inactiveColor);
    return this._attackedCoordsSet;
  }

  /**
   * Determine whether the position is active, checkmate or a draw and what kind of draw.
   */
  public get status(): GameStatus {
    if (!this.legalMoves.length)
      return (this.isCheck()) ? GameStatus.CHECKMATE : GameStatus.STALEMATE;
    if (this.board.size < 3)
      return GameStatus.INSUFFICIENT_MATERIAL;
    if (this.halfMoveClock > 50)
      return GameStatus.FIFTY_MOVE_DRAW;
    if (this.isTripleRepetition())
      return GameStatus.TRIPLE_REPETITION;
    return GameStatus.ACTIVE;
  }

  public isCheck(): boolean {
    return this.attackedCoordsSet.has(this.board.kings[this.colorToMove].coords);
  }

  private isTripleRepetition(): boolean {
    const pieceStr = this.board.toString();
    let repetitionCount = 0;

    for (let pos = this.prev; pos && repetitionCount < 3; pos = pos.prev)
      if (pos.colorToMove === this.colorToMove && pos.board.toString() === pieceStr)
        repetitionCount++;

    return repetitionCount === 3;
  }

  /**
   * Generates the moves that could be played without regard for whether it puts the current player in check.
   */
  private *pseudoLegalMoves(): Generator<[Coords, Coords], void, unknown> {
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const srcCoords = this.board.Coords.get(x, y)!;
        if (this.board.get(srcCoords)?.color === this.colorToMove)
          for (const destCoords of this.board.get(srcCoords)!.pseudoLegalMoves())
            yield [srcCoords, destCoords];
      }
    }
  }

  private handlePawnMove(pawn: Pawn, destCoords: Coords, promotionType: PromotedPieceInitial = "Q"): void {
    if (
      destCoords.y === this.enPassantFile
      && pawn.coords.x === Piece.middleRanks[pawn.oppositeColor]
    ) {
      pawn.board.delete(pawn.board.Coords.get(pawn.coords.x, destCoords.y)!);
      pawn.board.set(destCoords, pawn);
      pawn.coords = destCoords;
      return;
    }

    const piece = (destCoords.y === Piece.startPawnRanks[pawn.oppositeColor])
      ? pawn.promote(promotionType)
      : pawn;

    pawn.board.set(destCoords, piece).delete(pawn.coords);
    piece.coords = destCoords;
  }

  private handleKingMove(king: King, destCoords: Coords, castlingRights: CastlingRights): void {
    castlingRights[king.color][Wing.QUEEN_SIDE] = false;
    castlingRights[king.color][Wing.KING_SIDE] = false;

    const { coords: srcCoords, board } = king;
    const isCastling = Math.abs(destCoords.y - srcCoords.y) > 1
      || this.game.isChess960
      && board.get(destCoords)?.isRook()
      && board.get(destCoords)!.color === king.color;

    if (!isCastling) {
      board.transfer(srcCoords, destCoords);
      return;
    }

    const wing = (destCoords.y < srcCoords.y) ? Wing.QUEEN_SIDE : Wing.KING_SIDE;
    const destKingCoords = board.Coords.get(srcCoords.x, Piece.castledKingFiles[wing])!,
      rookSrcCoords = board.Coords.get(srcCoords.x, board.getStartRookFiles()[wing])!,
      rookDestCoords = board.Coords.get(srcCoords.x, Piece.castledRookFiles[wing])!;
    board
      .transfer(srcCoords, destKingCoords)
      .transfer(rookSrcCoords, rookDestCoords);
  }

  private handleRookMove(rook: Rook, destCoords: Coords, castlingRights: CastlingRights): void {
    if (rook.isOnInitialSquare())
      castlingRights[rook.color][rook.wing!] = false;
    rook.board.transfer(rook.coords, destCoords);
  }

  /**
   * The color to move isn't updated just yet as this position will be used
   * to verify if a move has put the currently active color in check.
   */
  public getPositionFromMove(
    srcCoords: Coords,
    destCoords: Coords,
    promotionType: PromotedPieceInitial = "Q",
    updateColorAndMoveNumber = false
  ): Position {
    const board = this.board.clone(),
      castlingRights = this.castlingRights.clone();
    const srcPiece = board.get(srcCoords) as Piece,
      destPiece = board.get(destCoords);
    const isSrcPiecePawn = srcPiece.isPawn(),
      isCaptureOrPawnMove = !!destPiece || isSrcPiecePawn;

    if (isSrcPiecePawn)
      this.handlePawnMove(srcPiece, destCoords, promotionType);
    else if (srcPiece.isKing())
      this.handleKingMove(srcPiece, destCoords, castlingRights);
    else if (srcPiece.isRook())
      this.handleRookMove(srcPiece, destCoords, castlingRights);
    else
      board.transfer(srcCoords, destCoords);

    if (destPiece?.isRook() && destPiece.isOnInitialSquare())
      castlingRights[destPiece.color][destPiece.wing!] = false;

    return new Position({
      board,
      castlingRights,
      enPassantFile: (isSrcPiecePawn && Math.abs(destCoords.x - srcCoords.x) > 1)
        ? srcCoords.y
        : -1,
      colorToMove: (updateColorAndMoveNumber) ? this.inactiveColor : this.colorToMove,
      halfMoveClock: (isCaptureOrPawnMove) ? 0 : this.halfMoveClock + 1,
      fullMoveNumber: (updateColorAndMoveNumber && this.colorToMove === Color.BLACK)
        ? this.fullMoveNumber + 1
        : this.fullMoveNumber
    });
  }

  public toString(): FenString {
    return [
      this.board.toString(),
      Position.colorAbbreviations[this.colorToMove],
      this.castlingRights.toString(),
      (this.enPassantFile === -1)
        ? "-"
        : this.board.Coords.get(Piece.middleRanks[this.colorToMove] - Piece.directions[this.colorToMove], this.enPassantFile)!.notation,
      String(this.halfMoveClock),
      String(this.fullMoveNumber)
    ].join(" ");
  }
}