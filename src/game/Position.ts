import { ReversedColor } from "@chacomat/constants/Color.js";
import Board from "@chacomat/game/Board.js";
import CastlingRights from "@chacomat/game/CastlingRights.js";
import Piece from "@chacomat/pieces/Piece.js";
import type {
  AlgebraicSquareNotation,
  ChessGame,
  Color,
  FenString,
  Move,
  PositionParameters,
  PromotedPieceType,
  Rook
} from "@chacomat/types.local.js";
import { InvalidFenError } from "@chacomat/utils/errors.js";
import fenChecker from "@chacomat/utils/fen-checker.js";
import {
  coordsToIndex,
  coordsToNotation,
  getFile,
  getRank, indexToCoords, indexToNotation,
  notationToIndex
} from "@chacomat/utils/Index.js";
import Bishop from "../pieces/sliding/Bishop.js";
/**
 * @classdesc An instance of this class is an immutable description of a position in a game. Its status cannot be altered.
 */
export default class Position {
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
    const colorToMove: Color = (color === "w") ? "WHITE" : "BLACK";
    return new this({
      board: new Board(pieceStr),
      colorToMove,
      castlingRights: this.CastlingRights.fromString(castlingStr),
      enPassantIndex: (enPassant === fenChecker.nullCharacter)
        ? -1
        : notationToIndex(enPassant as AlgebraicSquareNotation),
      halfMoveClock: +halfMoveClock,
      fullMoveNumber: +fullMoveNumber
    });
  }

  readonly board: Board;
  readonly castlingRights: CastlingRights;
  readonly colorToMove: Color;
  readonly halfMoveClock: number;
  readonly fullMoveNumber: number;
  game: ChessGame;
  prev: Position | null = null;
  next: Position[] = [];
  #legalMoves: Move[];
  #attackedIndicesSet: Set<number>;

  constructor({ board, castlingRights, colorToMove, enPassantIndex, halfMoveClock, fullMoveNumber }: PositionParameters) {
    this.board = board.setEnPassantIndex(enPassantIndex);
    this.castlingRights = castlingRights;
    this.colorToMove = colorToMove;
    this.halfMoveClock = halfMoveClock;
    this.fullMoveNumber = fullMoveNumber;
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
    return this.attackedIndicesSet.has(this.board.kings[this.colorToMove].getIndex());
  }

  isInsufficientMaterial(): boolean {
    if (this.board.size > 4)
      return false;

    const pieces = this.board.getNonKingPiecesByColor();

    if (pieces.WHITE.length > 1 || pieces.BLACK.length > 1)
      return false;

    const [whitePiece] = pieces.WHITE;
    const [blackPiece] = pieces.BLACK;
    if (whitePiece?.pieceName === "Bishop") {
      if (blackPiece?.pieceName === "Bishop")
        return (<Bishop>whitePiece).squareParity === (<Bishop>blackPiece).squareParity;
      return !blackPiece || blackPiece.pieceName === "Knight";
    }

    return (!whitePiece || whitePiece.pieceName === "Knight")
      && (
        !blackPiece
        || blackPiece.pieceName === "Knight"
        || blackPiece.pieceName === "Bishop"
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
      const king = this.board.kings[this.colorToMove];
      for (const destIndex of king.attackedIndices())
        legalMoves.push([king.getIndex(), destIndex]);
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

  /**
   * A different method is used in Chess960 to determine if a move is castling.
   */
  isCastling(king: Piece, destIndex: number): boolean {
    return Math.abs(getFile(destIndex) - king.getCoords().y) === 2;
  }

  // ===== ===== ===== ===== =====
  // PIECE MOVES
  // ===== ===== ===== ===== =====

  #handleRookMove(rook: Rook, destIndex: number, castlingRights: CastlingRights): void {
    if (rook.isOnInitialSquare(castlingRights))
      castlingRights.unset(rook.color, rook.getCoords().y);
    rook.getBoard().transfer(rook.getIndex(), destIndex);
  }

  #handlePawnMove(pawn: Piece, destIndex: number, promotionType: PromotedPieceType = "Q"): void {
    if (destIndex === pawn.getBoard().getEnPassantIndex()) {
      pawn.getBoard().delete(coordsToIndex(pawn.getCoords().x, getFile(destIndex)));
      pawn.getBoard().transfer(pawn.getIndex(), destIndex);
      return;
    }

    if (getRank(destIndex) === Piece.START_RANKS[pawn.oppositeColor]) {
      const pieceType = (<typeof Board>this.board.constructor).pieceTypesByInitial[promotionType];
      pawn = new (pieceType)(pawn.color).setIndex(pawn.getIndex()).setBoard(pawn.getBoard());
    }

    pawn.getBoard().transfer(pawn.getIndex(), destIndex);
  }

  #handleKingMove(king: Piece, destIndex: number, castlingRights: CastlingRights): void {
    castlingRights[king.color].length = 0;

    if (!this.isCastling(king, destIndex)) {
      king.getBoard().transfer(king.getIndex(), destIndex);
      return;
    }

    this.#castle(king, destIndex);
  }

  #castle(king: Piece, destIndex: number): void {
    const board = king.getBoard(),
      srcIndex = king.getIndex();
    const wing = (indexToCoords(destIndex).y < king.getCoords().y) ? 0 : 7;
    // These are distinct from `destIndex` as the latter may point to a same-colored rook in the case of castling.
    const kingDestIndex = coordsToIndex(getRank(srcIndex), Piece.CASTLED_KING_FILES[wing]);
    const rookSrcIndex = board.get(destIndex)?.pieceName === "Rook"
      ? destIndex
      : coordsToIndex(getRank(destIndex), wing);
    const rookDestIndex = coordsToIndex(getRank(srcIndex), Piece.CASTLED_ROOK_FILES[wing]);
    board
      .transfer(srcIndex, kingDestIndex)
      .transfer(rookSrcIndex, rookDestIndex);
  }

  /**
   * [X] Capture en passant pawn
   * [ ] Handle promotion
   * [ ] Handle castling
   */
  #isCheckAfterMove(srcIndex: number, destIndex: number): boolean {
    const capturedPiece = (
      (this.board.get(srcIndex) as Piece).pieceName === "Pawn"
      && destIndex === this.board.getEnPassantIndex()
    )
      ? this.board.atRank(getRank(srcIndex)).atFile(getFile(destIndex)) as Piece
      : this.board.get(destIndex);
    capturedPiece && this.board.delete(capturedPiece.getIndex());
    this.board.transfer(srcIndex, destIndex);

    const isCheck = this.board.getCoordsAttackedByColor(ReversedColor[this.colorToMove]).has(
      this.board.kings[this.colorToMove].getIndex()
    );

    this.board.transfer(destIndex, srcIndex);
    capturedPiece && this.board.set(capturedPiece.getIndex(), capturedPiece);

    return isCheck;
  }

  /**
   * The color to move isn't updated just yet as this position will be used
   * to verify if a move has put the currently active color in check.
   */
  createPositionFromMove(
    srcIndex: number,
    destIndex: number,
    promotionType: PromotedPieceType = "Q",
    updateColorAndMoveNumber = false
  ): Position {
    const board = this.board.clone(),
      castlingRights = this.castlingRights.clone();
    const srcPiece = board.get(srcIndex) as Piece,
      destPiece = board.get(destIndex);
    const isSrcPiecePawn = srcPiece.pieceName === "Pawn",
      isCaptureOrPawnMove = !!destPiece || isSrcPiecePawn;

    if (destPiece?.pieceName === "Rook" && (<Rook>destPiece).isOnInitialSquare(castlingRights))
      castlingRights.unset(destPiece.color, destPiece.getCoords().y);

    switch (srcPiece.pieceName) {
      case "Pawn":
        this.#handlePawnMove(srcPiece, destIndex, promotionType);
        break;
      case "King":
        this.#handleKingMove(srcPiece, destIndex, castlingRights);
        break;
      case "Rook":
        this.#handleRookMove(srcPiece as Rook, destIndex, castlingRights);
        break;
      default:
        board.transfer(srcIndex, destIndex);
    }

    return new (this.constructor as typeof Position)({
      board,
      castlingRights,
      enPassantIndex: (isSrcPiecePawn && Math.abs(getRank(destIndex) - getRank(srcIndex)) > 1)
        ? getFile(srcIndex)
        : -1,
      colorToMove: (updateColorAndMoveNumber) ? ReversedColor[this.colorToMove] : this.colorToMove,
      halfMoveClock: (isCaptureOrPawnMove) ? 0 : this.halfMoveClock + 1,
      fullMoveNumber: this.fullMoveNumber + Number(updateColorAndMoveNumber && this.colorToMove === "BLACK")
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
      (this.colorToMove === "WHITE") ? "w" : "b",
      this.castlingRights.toString(),
      (this.board.getEnPassantIndex() === -1)
        ? fenChecker.nullCharacter
        : coordsToNotation(
          Piece.START_RANKS[this.colorToMove] + Piece.DIRECTIONS[this.colorToMove],
          getFile(this.board.getEnPassantIndex())
        ),
      String(this.halfMoveClock),
      String(this.fullMoveNumber)
    ].join(" ");
  }
}