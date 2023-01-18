import Board from "@chacomat/game/Board.js";
import CastlingRights from "@chacomat/game/CastlingRights.js";
import Piece from "@chacomat/pieces/Piece.js";
import Color, { ReversedColor } from "@chacomat/utils/Color.js";
import { GameStatus } from "@chacomat/utils/constants.js";
import fenChecker from "@chacomat/utils/fen-checker.js";
import { InvalidFenError } from "@chacomat/utils/errors.js";
import type {
  AlgebraicSquareNotation,
  ChessGame,
  Coords,
  FenString,
  Move,
  PositionInfo,
  PromotedPieceInitial
} from "@chacomat/types.js";

/**
 * @classdesc An instance of this class is an immutable description of a position in a game. Its status cannot be altered.
 */
export default class Position implements PositionInfo {
  public static readonly startFenString: FenString = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
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
    if (!fenChecker.isValidFenString(fenString))
      throw new InvalidFenError(fenString);

    const [
      pieceStr,
      color,
      castlingStr,
      enPassant,
      halfMoveClock,
      fullMoveNumber,
    ] = fenString.split(" ");
    const board = new Board(pieceStr);
    const position = new this({
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

  public readonly board: Board;
  public readonly castlingRights: CastlingRights;
  public readonly colorToMove: Color;
  public readonly enPassantFile: number;
  public readonly halfMoveClock: number;
  public readonly fullMoveNumber: number;
  public game: ChessGame;
  public prev: Position | null = null;
  public next: Position[] = [];
  #legalMoves: Move[];
  #attackedCoordsSet: Set<Coords>;

  constructor(positionInfo: PositionInfo) {
    Object.assign(this, positionInfo);
    this.board.position = this;
  }

  // ===== ===== ===== ===== =====
  // STATE
  // ===== ===== ===== ===== =====

  public get inactiveColor(): Color {
    return ReversedColor[this.colorToMove];
  }

  public get attackedCoordsSet(): Set<Coords> {
    this.#attackedCoordsSet ??= this.board.getCoordsAttackedByColor(this.inactiveColor);
    return this.#attackedCoordsSet;
  }

  // ===== ===== ===== ===== =====
  // STATUS
  // ===== ===== ===== ===== =====

  /**
   * Determine whether the position is active, checkmate or a draw and what kind of draw.
   */
  public get status(): GameStatus {
    if (!this.legalMoves.length)
      return (this.isCheck()) ? GameStatus.CHECKMATE : GameStatus.STALEMATE;
    if (this.isInsufficientMaterial())
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

  protected isInsufficientMaterial(): boolean {
    if (this.board.size > 4)
      return false;

    const pieces = this.board.getNonKingPiecesByColor();

    if (pieces[Color.WHITE].length > 1 || pieces[Color.BLACK].length > 1)
      return false;

    const [whitePiece] = pieces[Color.WHITE];
    const [blackPiece] = pieces[Color.BLACK];
    return (!whitePiece || whitePiece.isKnight() || whitePiece.isBishop())
      && (
        !blackPiece
        || blackPiece.isKnight()
        || blackPiece.isBishop() && Piece.getBishopSquareParity(blackPiece) === Piece.getBishopSquareParity(whitePiece)
      );
  }

  protected isTripleRepetition(): boolean {
    const pieceStr = this.board.toString();
    let repetitionCount = 0;

    for (
      let pos = this.prev;
      pos !== null && repetitionCount < 3;
      pos = pos.prev
    ) {
      if (pos.colorToMove === this.colorToMove && pos.board.toString() === pieceStr)
        repetitionCount++;
    }

    return repetitionCount === 3;
  }

  // ===== ===== ===== ===== =====
  // LEGAL MOVES
  // ===== ===== ===== ===== =====

  public get legalMoves(): Move[] {
    if (this.#legalMoves)
      return this.#legalMoves;

    const legalMoves: Move[] = [];

    for (const move of this.pseudoLegalMoves())
      if (!this.isCheckAfterMove(move[0], move[1]))
        legalMoves.push(move);

    if (!this.isCheck()) {
      const king = this.board.kings[this.colorToMove];
      for (const destCoords of Piece.castlingCoords(
        king,
        (this.constructor as typeof Position).useChess960Castling
      ))
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

  /**
   * Generates the moves that could be played without regard for whether it puts the current player in check.
   */
  protected *pseudoLegalMoves(): Generator<[Coords, Coords], void, unknown> {
    const entries = [...this.board.entries()];

    for (const [srcCoords, piece] of entries)
      if (piece?.color === this.colorToMove)
        for (const destCoords of piece.pseudoLegalMoves())
          yield [srcCoords, destCoords];
  }

  // ===== ===== ===== ===== =====
  // PIECE MOVES
  // ===== ===== ===== ===== =====

  protected handleRookMove(rook: Piece, destCoords: Coords, castlingRights: CastlingRights): void {
    if (Piece.isRookOnInitialSquare(rook, castlingRights))
      castlingRights.unset(rook.color, rook.coords.y);
    rook.board.transfer(rook.coords, destCoords);
  }

  protected handlePawnMove(pawn: Piece, destCoords: Coords, promotionType: PromotedPieceInitial = Piece.TYPES.QUEEN): void {
    if (this.isEnPassantCapture(pawn.coords, destCoords)) {
      pawn.board.delete(pawn.board.Coords.get(pawn.coords.x, destCoords.y));
      pawn.board.transfer(pawn.coords, destCoords);
      return;
    }

    if (destCoords.x === Piece.START_RANKS.PIECE[pawn.oppositeColor])
      pawn.type = promotionType;

    pawn.board.transfer(pawn.coords, destCoords);
  }

  public isEnPassantCapture(srcCoords: Coords, destCoords: Coords): boolean {
    return destCoords.y === this.enPassantFile
      && srcCoords.x === Piece.MIDDLE_RANKS[this.inactiveColor];
  }

  protected handleKingMove(king: Piece, destCoords: Coords, castlingRights: CastlingRights): void {
    castlingRights[king.color].length = 0;

    if (!this.isCastling(king, destCoords)) {
      king.board.transfer(king.coords, destCoords);
      return;
    }

    this.castle(king, destCoords);
  }

  protected castle(king: Piece, destCoords: Coords): void {
    const { board, coords: srcCoords } = king;
    const wing = Piece.getWingRelativeToKing(srcCoords.y, destCoords.y);
    // These are distinct from `destCoords` as the latter may point to a same-colored rook in the case of castling.
    const destKingCoords = board.Coords.get(srcCoords.x, Piece.CASTLED_FILES.KING[wing]);
    const rookSrcCoords = board.get(destCoords)?.isRook()
      ? destCoords
      : board.Coords.get(destCoords.x, wing);
    const rookDestCoords = board.Coords.get(srcCoords.x, Piece.CASTLED_FILES.ROOK[wing]);
    board
      .transfer(srcCoords, destKingCoords)
      .transfer(rookSrcCoords, rookDestCoords);
  }

  /**
   * A different method is used in Chess960 to determine if a move is castling.
   */
  protected isCastling(king: Piece, destCoords: Coords): boolean {
    return Math.abs(destCoords.y - king.coords.y) === 2;
  }

  /**
   * [X] Capture en passant pawn
   * [ ] Handle promotion
   * [ ] Handle castling
   */
  public isCheckAfterMove(srcCoords: Coords, destCoords: Coords): boolean {
    const capturedPiece = (
      (this.board.get(srcCoords) as Piece).isPawn()
      && this.isEnPassantCapture(srcCoords, destCoords)
    )
      ? this.board.getRank(srcCoords.x).getFile(destCoords.y) as Piece
      : this.board.get(destCoords);
    capturedPiece && this.board.delete(capturedPiece.coords);
    this.board.transfer(srcCoords, destCoords);

    const isCheck = this.board.getCoordsAttackedByColor(this.inactiveColor).has(
      this.board.kings[this.colorToMove].coords
    );

    this.board.transfer(destCoords, srcCoords);
    capturedPiece && this.board.set(capturedPiece.coords, capturedPiece);

    return isCheck;
  }

  /**
   * The color to move isn't updated just yet as this position will be used
   * to verify if a move has put the currently active color in check.
   */
  public createPositionFromMove(
    srcCoords: Coords,
    destCoords: Coords,
    promotionType: PromotedPieceInitial = Piece.TYPES.QUEEN,
    updateColorAndMoveNumber = false
  ): Position {
    const board = this.board.clone(),
      castlingRights = this.castlingRights.clone();
    const srcPiece = board.get(srcCoords) as Piece,
      destPiece = board.get(destCoords);
    const isSrcPiecePawn = srcPiece.isPawn(),
      isCaptureOrPawnMove = !!destPiece || isSrcPiecePawn;

    if (destPiece?.isRook() && Piece.isRookOnInitialSquare(destPiece, castlingRights))
      castlingRights.unset(destPiece.color, destPiece.coords.y);

    if (isSrcPiecePawn)
      this.handlePawnMove(srcPiece, destCoords, promotionType);
    else if (srcPiece.isKing())
      this.handleKingMove(srcPiece, destCoords, castlingRights);
    else if (srcPiece.isRook())
      this.handleRookMove(srcPiece, destCoords, castlingRights);
    else
      board.transfer(srcCoords, destCoords);

    return new (this.constructor as typeof Position)({
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

  // ===== ===== ===== ===== =====
  // MISC
  // ===== ===== ===== ===== =====

  /**
   * @returns The FEN string of this position.
   */
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