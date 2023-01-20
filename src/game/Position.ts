import Color, { colorAbbreviations, ReversedColor } from "@chacomat/constants/Color.js";
import Board from "@chacomat/game/Board.js";
import CastlingRights from "@chacomat/game/CastlingRights.js";
import Piece from "@chacomat/pieces/Piece.js";
import type {
  AlgebraicSquareNotation,
  ChessGame,
  FenString,
  IndexGenerator,
  Move,
  PositionParameters,
  PromotedPieceType
} from "@chacomat/types.js";
import { InvalidFenError } from "@chacomat/utils/errors.js";
import fenChecker from "@chacomat/utils/fen-checker.js";
import {
  coordsToIndex,
  coordsToNotation,
  getFile,
  getRank,
  indexToCoords,
  indexToNotation,
  notationToIndex
} from "@chacomat/utils/Index.js";
/**
 * @classdesc An instance of this class is an immutable description of a position in a game. Its status cannot be altered.
 */
export default class Position implements PositionParameters {
  static readonly startFenString: FenString = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  static readonly CastlingRights: typeof CastlingRights = CastlingRights;

  /**
   * Create a new position using only an FEN string.
   */
  static fromFenString(fenString: FenString): Position {
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
      colorToMove: colorAbbreviations[color as keyof object] as Color,
      enPassantFile: (enPassant === fenChecker.nullCharacter)
        ? -1
        : getFile(notationToIndex(enPassant as AlgebraicSquareNotation)),
      halfMoveClock: +halfMoveClock,
      fullMoveNumber: +fullMoveNumber
    });
    board.position = position;
    return position;
  }

  readonly board: Board;
  readonly castlingRights: CastlingRights;
  readonly colorToMove: Color;
  readonly enPassantFile: number;
  readonly halfMoveClock: number;
  readonly fullMoveNumber: number;
  game: ChessGame;
  prev: Position | null = null;
  next: Position[] = [];
  #legalMoves: Move[];
  #attackedIndicesSet: Set<number>;

  constructor(positionInfo: PositionParameters) {
    Object.assign(this, positionInfo);
    this.board.position = this;
  }

  // ===== ===== ===== ===== =====
  // ATTACKED INDICES
  // ===== ===== ===== ===== =====

  get attackedIndicesSet(): Set<number> {
    this.#attackedIndicesSet ??= this.board.getCoordsAttackedByColor(ReversedColor[this.colorToMove]);
    return this.#attackedIndicesSet;
  }

  // ===== ===== ===== ===== =====
  // STATUS
  // ===== ===== ===== ===== =====

  isCheck(): boolean {
    return this.attackedIndicesSet.has(this.board.kings[this.colorToMove].index);
  }

  isInsufficientMaterial(): boolean {
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

  isTripleRepetition(): boolean {
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

  get legalMoves(): Move[] {
    if (this.#legalMoves)
      return this.#legalMoves;

    const legalMoves: Move[] = [];

    for (const move of this.#pseudoLegalMoves())
      if (!this.#isCheckAfterMove(move[0], move[1]))
        legalMoves.push(move);

    if (!this.isCheck()) {
      for (const destIndex of this.castlingCoords())
        legalMoves.push([this.board.kings[this.colorToMove].index, destIndex]);
    }

    return (this.#legalMoves = legalMoves);
  }

  /**
   * @returns A human-readable array of moves as strings following the pattern `e2-e4`.
   */
  get legalMovesAsNotation(): string[] {
    return this.legalMoves.map(([srcIndex, destIndex]) => {
      return `${indexToNotation(srcIndex)}-${indexToNotation(destIndex)}`;
    });
  }

  *castlingCoords(): IndexGenerator {
    yield* Piece.castlingCoords(this.board.kings[this.colorToMove], false);
  }

  /**
   * Generates the moves that could be played without regard for whether it puts the current player in check.
   */
  *#pseudoLegalMoves(): Generator<Move, void, unknown> {
    const entries = [...this.board.entries()];

    for (const [srcIndex, piece] of entries)
      if (piece?.color === this.colorToMove)
        for (const destIndex of piece.pseudoLegalMoves())
          yield [srcIndex, destIndex];
  }

  // ===== ===== ===== ===== =====
  // MOVE TYPES
  // ===== ===== ===== ===== =====

  isEnPassantCapture(srcIndex: number, destIndex: number): boolean {
    return indexToCoords(destIndex).y === this.enPassantFile
      && indexToCoords(srcIndex).x === Piece.MIDDLE_RANKS[ReversedColor[this.colorToMove]];
  }

  /**
   * A different method is used in Chess960 to determine if a move is castling.
   */
  isCastling(king: Piece, destIndex: number): boolean {
    return Math.abs(getFile(destIndex) - king.coords.y) === 2;
  }

  // ===== ===== ===== ===== =====
  // PIECE MOVES
  // ===== ===== ===== ===== =====

  #handleRookMove(rook: Piece, destIndex: number, castlingRights: CastlingRights): void {
    if (Piece.isRookOnInitialSquare(rook, castlingRights))
      castlingRights.unset(rook.color, rook.coords.y);
    rook.board.transfer(rook.index, destIndex);
  }

  #handlePawnMove(pawn: Piece, destIndex: number, promotionType: PromotedPieceType = Piece.TYPES.QUEEN): void {
    if (this.isEnPassantCapture(pawn.index, destIndex)) {
      pawn.board.delete(coordsToIndex(pawn.coords.x, getFile(destIndex)));
      pawn.board.transfer(pawn.index, destIndex);
      return;
    }

    if (getRank(destIndex) === Piece.START_RANKS.PIECE[pawn.oppositeColor])
      pawn.type = promotionType;

    pawn.board.transfer(pawn.index, destIndex);
  }

  #handleKingMove(king: Piece, destIndex: number, castlingRights: CastlingRights): void {
    castlingRights[king.color].length = 0;

    if (!this.isCastling(king, destIndex)) {
      king.board.transfer(king.index, destIndex);
      return;
    }

    this.#castle(king, destIndex);
  }

  #castle(king: Piece, destIndex: number): void {
    const { board, index: srcIndex } = king;
    const wing = Piece.getWingRelativeToKing(getFile(srcIndex), getFile(destIndex));
    // These are distinct from `destIndex` as the latter may point to a same-colored rook in the case of castling.
    const destKingIndex = coordsToIndex(getRank(srcIndex), Piece.CASTLED_FILES.KING[wing]);
    const rookSrcIndex = board.get(destIndex)?.isRook()
      ? destIndex
      : coordsToIndex(getRank(destIndex), wing);
    const rookDestIndex = coordsToIndex(getRank(srcIndex), Piece.CASTLED_FILES.ROOK[wing]);
    board
      .transfer(srcIndex, destKingIndex)
      .transfer(rookSrcIndex, rookDestIndex);
  }

  /**
   * [X] Capture en passant pawn
   * [ ] Handle promotion
   * [ ] Handle castling
   */
  #isCheckAfterMove(srcIndex: number, destIndex: number): boolean {
    const capturedPiece = (
      (this.board.get(srcIndex) as Piece).isPawn()
      && this.isEnPassantCapture(srcIndex, destIndex)
    )
      ? this.board.atRank(getRank(srcIndex)).atFile(getFile(destIndex)) as Piece
      : this.board.get(destIndex);
    capturedPiece && this.board.delete(capturedPiece.index);
    this.board.transfer(srcIndex, destIndex);

    const isCheck = this.board.getCoordsAttackedByColor(ReversedColor[this.colorToMove]).has(
      this.board.kings[this.colorToMove].index
    );

    this.board.transfer(destIndex, srcIndex);
    capturedPiece && this.board.set(capturedPiece.index, capturedPiece);

    return isCheck;
  }

  /**
   * The color to move isn't updated just yet as this position will be used
   * to verify if a move has put the currently active color in check.
   */
  createPositionFromMove(
    srcIndex: number,
    destIndex: number,
    promotionType: PromotedPieceType = Piece.TYPES.QUEEN,
    updateColorAndMoveNumber = false
  ): Position {
    const board = this.board.clone(),
      castlingRights = this.castlingRights.clone();
    const srcPiece = board.get(srcIndex) as Piece,
      destPiece = board.get(destIndex);
    const isSrcPiecePawn = srcPiece.isPawn(),
      isCaptureOrPawnMove = !!destPiece || isSrcPiecePawn;

    if (destPiece?.isRook() && Piece.isRookOnInitialSquare(destPiece, castlingRights))
      castlingRights.unset(destPiece.color, destPiece.coords.y);

    if (isSrcPiecePawn)
      this.#handlePawnMove(srcPiece, destIndex, promotionType);
    else if (srcPiece.isKing())
      this.#handleKingMove(srcPiece, destIndex, castlingRights);
    else if (srcPiece.isRook())
      this.#handleRookMove(srcPiece, destIndex, castlingRights);
    else
      board.transfer(srcIndex, destIndex);

    return new (this.constructor as typeof Position)({
      board,
      castlingRights,
      enPassantFile: (isSrcPiecePawn && Math.abs(getRank(destIndex) - getRank(srcIndex)) > 1)
        ? getFile(srcIndex)
        : -1,
      colorToMove: (updateColorAndMoveNumber) ? ReversedColor[this.colorToMove] : this.colorToMove,
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
  toString(): FenString {
    return [
      this.board.toString(),
      colorAbbreviations[this.colorToMove],
      this.castlingRights.toString(),
      (this.enPassantFile === -1)
        ? fenChecker.nullCharacter
        : coordsToNotation(
          Piece.MIDDLE_RANKS[this.colorToMove] - Piece.DIRECTIONS[this.colorToMove],
          this.enPassantFile
        ),
      String(this.halfMoveClock),
      String(this.fullMoveNumber)
    ].join(" ");
  }
}