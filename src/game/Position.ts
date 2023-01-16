import { Color, GameStatus } from "@chacomat/utils/constants.js";
import Board from "@chacomat/game/Board.js";
import CastlingRights from "@chacomat/game/CastlingRights.js";
import Piece from "@chacomat/pieces/Piece.js";
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
} from "@chacomat/types.js";

/**
 * @classdesc An instance of this class is an immutable description of a position in a game. Its status cannot be altered.
 */
export default class Position implements PositionInfo {
  public static readonly startFenString: ChacoMat.FenString = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  public static readonly CastlingRights: typeof CastlingRights = CastlingRights;
  protected static readonly useChess960Castling: boolean = false;

  protected static readonly colorAbbreviations = {
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
      pieceStr,
      color,
      castlingStr,
      enPassant,
      halfMoveClock,
      fullMoveNumber,
    ] = fenString.split(" ");
    const board = new Board(pieceStr);
    const position = new Position({
      board,
      castlingRights: this.CastlingRights.fromString(castlingStr),
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

  /**
   * A different method is used in Chess960 to determine if a move is castling.
   */
  protected static isCastling(king: King, destCoords: Coords) {
    return Math.abs(destCoords.y - king.coords.y) === 2;
  }

  public readonly board: Board;
  public readonly castlingRights: CastlingRights;
  public readonly colorToMove: Color;
  public readonly enPassantFile: number;
  public readonly halfMoveClock: number;
  public readonly fullMoveNumber: number;
  public prev: Position | null = null;
  public next: Position[] = [];
  public game: ChessGame;
  #legalMoves: Move[];
  #attackedCoordsSet: Set<Coords>;

  constructor(positionInfo: PositionInfo) {
    Object.assign(this, positionInfo);
    this.board.position = this;
  }

  public get inactiveColor(): Color {
    return (this.colorToMove === Color.WHITE) ? Color.BLACK : Color.WHITE;
  }

  public get legalMoves(): Move[] {
    if (this.#legalMoves)
      return this.#legalMoves;

    const legalMoves: Move[] = [];

    for (const move of this.pseudoLegalMoves())
      if (!this.getPositionFromMove(move[0], move[1]).isCheck())
        legalMoves.push(move);

    if (!this.isCheck()) {
      const king = this.board.kings[this.colorToMove];
      for (const destCoords of king.castlingCoords((this.constructor as typeof Position).useChess960Castling))
        legalMoves.push([king.coords, destCoords]);
    }

    return (this.#legalMoves = legalMoves);
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
    this.#attackedCoordsSet ??= this.board.getCoordsAttackedByColor(this.inactiveColor);
    return this.#attackedCoordsSet;
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

  protected isTripleRepetition(): boolean {
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
  protected *pseudoLegalMoves(): Generator<[Coords, Coords], void, unknown> {
    for (const [srcCoords, piece] of this.board)
      if (piece?.color === this.colorToMove)
        for (const destCoords of piece.pseudoLegalMoves())
          yield [srcCoords, destCoords];
  }

  protected handleRookMove(rook: Rook, destCoords: Coords, castlingRights: CastlingRights): void {
    if (rook.isOnInitialSquare())
      castlingRights.unset(rook.color, rook.coords.y);
    rook.board.transfer(rook.coords, destCoords);
  }

  protected handlePawnMove(pawn: Pawn, destCoords: Coords, promotionType: PromotedPieceInitial = Piece.WHITE_PIECE_INITIALS.QUEEN): void {
    if (
      destCoords.y === this.enPassantFile
      && pawn.coords.x === Piece.MIDDLE_RANKS[pawn.oppositeColor]
    ) {
      pawn.board.delete(pawn.board.Coords.get(pawn.coords.x, destCoords.y));
      pawn.board.set(destCoords, pawn);
      pawn.coords = destCoords;
      return;
    }

    const piece = (destCoords.y === Piece.START_PAWN_RANKS[pawn.oppositeColor])
      ? pawn.promote(promotionType)
      : pawn;

    pawn.board.set(destCoords, piece).delete(pawn.coords);
    piece.coords = destCoords;
  }

  protected handleKingMove(king: King, destCoords: Coords, castlingRights: CastlingRights): void {
    castlingRights[king.color].length = 0;

    if ((this.constructor as typeof Position).isCastling(king, destCoords)) {
      this.castle(king, destCoords);
      return;
    }

    king.board.transfer(king.coords, destCoords);
  }

  protected castle(king: King, destCoords: Coords): void {
    const { board, coords: srcCoords } = king;
    const wing = king.getWing(destCoords.y);
    const destKingCoords = board.Coords.get(srcCoords.x, Piece.CASTLED_KING_FILES[wing]);
    const rookSrcCoords = board.get(destCoords)?.isRook()
      ? destCoords
      : board.Coords.get(destCoords.x, wing);
    const rookDestCoords = board.Coords.get(srcCoords.x, Piece.CASTLED_ROOK_FILES[wing]);
    board
      .transfer(srcCoords, destKingCoords)
      .transfer(rookSrcCoords, rookDestCoords);
  }

  /**
   * The color to move isn't updated just yet as this position will be used
   * to verify if a move has put the currently active color in check.
   */
  public getPositionFromMove(
    srcCoords: Coords,
    destCoords: Coords,
    promotionType: PromotedPieceInitial = Piece.WHITE_PIECE_INITIALS.QUEEN,
    updateColorAndMoveNumber = false
  ): Position {
    const board = this.board.clone(),
      castlingRights = this.castlingRights.clone();
    const srcPiece = board.get(srcCoords) as Piece,
      destPiece = board.get(destCoords);
    const isSrcPiecePawn = srcPiece.isPawn(),
      isCaptureOrPawnMove = !!destPiece || isSrcPiecePawn;

    if (destPiece?.isRook() && destPiece.isOnInitialSquare())
      castlingRights.unset(destPiece.color, destPiece.coords.y);

    if (isSrcPiecePawn)
      this.handlePawnMove(srcPiece, destCoords, promotionType);
    else if (srcPiece.isKing())
      this.handleKingMove(srcPiece, destCoords, castlingRights);
    else if (srcPiece.isRook())
      this.handleRookMove(srcPiece, destCoords, castlingRights);
    else
      board.transfer(srcCoords, destCoords);

    return new Position({
      board,
      castlingRights,
      enPassantFile: (isSrcPiecePawn && Math.abs(destCoords.x - srcCoords.x) > 1)
        ? srcCoords.y
        : -1,
      colorToMove: (updateColorAndMoveNumber) ? this.inactiveColor : this.colorToMove,
      halfMoveClock: (isCaptureOrPawnMove) ? 0 : this.halfMoveClock + 1,
      fullMoveNumber: this.fullMoveNumber + Number(updateColorAndMoveNumber && this.colorToMove === Color.BLACK)
    });
  }

  public toString(): FenString {
    return [
      this.board.toString(),
      Position.colorAbbreviations[this.colorToMove],
      this.castlingRights.toString(),
      (this.enPassantFile === -1)
        ? "-"
        : this.board.Coords.get(
          Piece.MIDDLE_RANKS[this.colorToMove] - Piece.DIRECTIONS[this.colorToMove],
          this.enPassantFile
        ).notation,
      String(this.halfMoveClock),
      String(this.fullMoveNumber)
    ].join(" ");
  }
}