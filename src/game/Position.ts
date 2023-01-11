import GameStatus from "../constants/GameStatus.js";
import Color from "../constants/Color.js";
import Wing from "../constants/Wing.js";
import Piece from "../pieces/Piece.js";
import type {
  AlgebraicSquareNotation,
  Coords,
  FenString,
  King,
  Move,
  Pawn,
  PositionInfo,
  Promotable,
  Rook
} from "../types.js";
import Board from "./Board.js";
import CastlingRights from "./CastlingRights.js";

/**
 * @classdesc An instance of this class is an immutable description of a position in a game. Its status cannot be altered.
 */
export default class Position implements PositionInfo {
  public static readonly startFenString: FenString = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  private static readonly colorAbbreviations = {
    w: Color.WHITE,
    b: Color.BLACK
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
    return new Position({
      board,
      castlingRights: CastlingRights.fromString(castlingString),
      colorToMove: Position.colorAbbreviations[color as keyof typeof Position.colorAbbreviations],
      enPassantFile: (enPassant === "-")
        ? -1
        : board.Coords.fromNotation(enPassant as AlgebraicSquareNotation)!.y,
      halfMoveClock: +halfMoveClock,
      fullMoveNumber: +fullMoveNumber,
    });
  }

  private static getWing(file: number): Wing {
    return (file < 4) ? Wing.QUEEN_SIDE : Wing.KING_SIDE;
  }

  public readonly board: Board;
  public readonly castlingRights: CastlingRights;
  public readonly colorToMove: Color;
  /**
   * The empty square index where an en passant capture can be played.
   */
  public readonly enPassantFile: number;
  public readonly halfMoveClock: number;
  public readonly fullMoveNumber: number;
  private _legalMoves: Move[];
  private _attackedCoordsSet: Set<Coords>;
  public prev: Position | null = null;
  public next: Position[] = [];

  constructor(positionInfo: PositionInfo) {
    Object.assign(this, positionInfo);
  }

  public get inactiveColor(): Color {
    return (this.colorToMove === Color.WHITE) ? Color.BLACK : Color.WHITE;
  }

  public get legalMoves(): Move[] {
    if (this._legalMoves)
      return this._legalMoves;

    this._legalMoves = [];

    for (const move of this.pseudoLegalMoves())
      if (!this.getPositionFromMove(move[0], move[1]).isCheck())
        this._legalMoves.push(move);

    if (!this.isCheck()) {
      const kingCoords = this.board.kingCoords[this.colorToMove];
      for (const destCoords of (this.board.get(kingCoords) as King).castlingCoords(kingCoords, this.attackedCoordsSet, this))
        this._legalMoves.push([kingCoords, destCoords]);
    }

    return this._legalMoves;
  }

  /**
   * @returns A human-readable array of moves as strings following the pattern `e2-e4`.
   */
  public get legalMovesAsNotation(): string[] {
    return this.legalMoves.map(([srcCoords, destCoords]) =>
      `${srcCoords.notation}-${destCoords.notation}`
    );
  }

  private get attackedCoordsSet(): Set<Coords> {
    this._attackedCoordsSet ??= this.board.getCoordsAttackedByColor(this.inactiveColor);
    return this._attackedCoordsSet;
  }

  /**
   * Determine whether the position is active, checkmate or a draw and what kind of draw.
   */
  public get status(): GameStatus {
    if (!this.legalMoves.length)
      return (this.isCheck()) ? GameStatus.CHECKMATE : GameStatus.STALEMATE;
    if (this.board.pieceCount < 3)
      return GameStatus.INSUFFICIENT_MATERIAL;
    if (this.halfMoveClock > 50)
      return GameStatus.FIFTY_MOVE_DRAW;
    if (this.isTripleRepetition())
      return GameStatus.TRIPLE_REPETITION;
    return GameStatus.ACTIVE;
  }

  public isCheck(): boolean {
    return this.attackedCoordsSet.has(this.board.kingCoords[this.colorToMove]);
  }

  private isTripleRepetition(): boolean {
    const pieceStr = this.board.toString();
    let repetitionCount = 0;

    for (let current = this.prev; current && repetitionCount < 3; current = current.prev)
      if (current.colorToMove === this.colorToMove && current.board.toString() === pieceStr)
        repetitionCount++;

    return repetitionCount === 3;
  }

  /**
   * Generates the moves that could be played without regard for whether it puts the current player in check.
   */
  private *pseudoLegalMoves(): Generator<Move, void, unknown> {
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const srcCoords = this.board.Coords.get(x, y)!;
        if (this.board.get(srcCoords)?.color === this.colorToMove)
          for (const destCoords of this.board.get(srcCoords)!.pseudoLegalMoves(srcCoords, this))
            yield [srcCoords, destCoords] as Move;
      }
    }
  }

  private handlePawnMove(srcPiece: Pawn, srcCoords: Coords, destCoords: Coords, board: Board, promotionType: Promotable = "Q"): Piece {
    if (
      destCoords.y === this.enPassantFile
      && srcCoords.x === Piece.middleRanks[srcPiece.oppositeColor]
    ) {
      board.unset(board.Coords.get(srcCoords.x, destCoords.y)!);
      return srcPiece;
    }

    if (destCoords.y === Piece.initialPieceRanks[this.inactiveColor])
      return srcPiece.promote(promotionType);

    return srcPiece;
  }

  private handleKingMove(srcCoords: Coords, destCoords: Coords, board: Board, castlingRights: CastlingRights, srcColor: Color): void {
    castlingRights[srcColor][Wing.QUEEN_SIDE] = false;
    castlingRights[srcColor][Wing.KING_SIDE] = false;
    board.kingCoords[srcColor] = destCoords;

    if (Math.abs(destCoords.y - srcCoords.y) > 1) {
      const wing = Position.getWing(destCoords.y);
      const rookCoords = board.Coords.get(srcCoords.x, wing)!;
      board
        .set(board.Coords.get(srcCoords.x, Piece.castledRookFiles[wing])!, board.get(rookCoords)!)
        .unset(rookCoords);
    }
  }

  /**
   * The color to move isn't updated just yet as this position will be used to verify if a move has put the currently active color in check.
   */
  public getPositionFromMove(
    srcCoords: Coords,
    destCoords: Coords,
    promotionType: Promotable = "Q",
    updateColorAndMoveNumber = false,
  ): Position {
    const board = this.board.clone(),
      castlingRights = this.castlingRights.clone();

    let srcPiece = board.get(srcCoords) as Piece,
      destPiece = board.get(destCoords);

    const srcInitial = srcPiece.whiteInitial,
      isSrcPiecePawn = srcInitial === "P",
      isCaptureOrPawnMove = !!destPiece || isSrcPiecePawn;

    switch (srcInitial) {
      case "P":
        srcPiece = this.handlePawnMove(srcPiece as Pawn, srcCoords, destCoords, board, promotionType);
        break;
      case "K":
        this.handleKingMove(srcCoords, destCoords, board, castlingRights, srcPiece.color);
        break;
      case "R":
        if ((srcPiece as Rook).isOnInitialSquare(srcCoords))
          castlingRights[srcPiece.color][srcCoords.y as Wing] = false;
    }

    if (destPiece?.whiteInitial === "R" && (destPiece as Rook).isOnInitialSquare(destCoords))
      castlingRights[destPiece.color][destCoords.y as Wing] = false;

    board.set(destCoords, srcPiece).unset(srcCoords);

    return new Position({
      board,
      castlingRights,
      enPassantFile: (isSrcPiecePawn && Math.abs(destCoords.x - srcCoords.x) > 1)
        ? srcCoords.y
        : -1,
      colorToMove: (updateColorAndMoveNumber)
        ? this.inactiveColor
        : this.colorToMove,
      halfMoveClock: (isCaptureOrPawnMove) ? 0 : this.halfMoveClock + 1,
      fullMoveNumber: (updateColorAndMoveNumber && this.colorToMove === Color.BLACK)
        ? this.fullMoveNumber + 1
        : this.fullMoveNumber
    });
  }

  public toString(): FenString {
    return [
      this.board.toString(),
      (this.colorToMove === Color.WHITE) ? "w" : "b",
      this.castlingRights.toString(),
      (this.enPassantFile === -1)
        ? "-"
        : this.board.Coords.get(Piece.middleRanks[this.colorToMove] - Piece.directions[this.colorToMove], this.enPassantFile)!.notation,
      String(this.halfMoveClock),
      String(this.fullMoveNumber)
    ].join(" ");
  }
}