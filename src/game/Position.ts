import { ReversedColor } from "@chacomat/constants/Color.js";
import Board from "@chacomat/game/Board.js";
import CastlingRights from "@chacomat/game/CastlingRights.js";
import Piece, {
  Bishop, King, Knight, Pawn, Rook
} from "@chacomat/pieces/index.js";
import type {
  AlgebraicSquareNotation,
  ChessGame,
  Color,
  FenString,
  Move,
  PositionParameters,
  PromotedPieceType
} from "@chacomat/types.local.js";
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
      board: Board.fromString(pieceStr),
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

    const nonKingPieces = [...this.board.values()].reduce((acc, piece) => {
      if (!(piece instanceof King))
        acc[piece.color].push(piece);
      return acc;
    }, {
      WHITE: [] as Piece[],
      BLACK: [] as Piece[]
    });

    const [whitePiece] = nonKingPieces.WHITE;
    const [blackPiece] = nonKingPieces.BLACK;

    if (!whitePiece)
      return !blackPiece || blackPiece instanceof Bishop || blackPiece instanceof Knight;

    if (whitePiece instanceof Knight)
      return !blackPiece || blackPiece instanceof Knight;

    if (whitePiece instanceof Bishop)
      return !blackPiece
        || blackPiece instanceof Bishop && whitePiece.colorComplex === blackPiece.colorComplex;

    return false;
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
      for (const destIndex of this.castlingIndices())
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

  *castlingIndices() {
    yield* this.board.kings[this.colorToMove].castlingIndices(false);
  }

  // ===== ===== ===== ===== =====
  // PIECE MOVES
  // ===== ===== ===== ===== =====

  #handleRookMove(rook: Rook, destIndex: number, castlingRights: CastlingRights): void {
    if (rook.isOnInitialSquare(castlingRights))
      castlingRights.unset(rook.color, rook.getCoords().y);
    rook.getBoard().transfer(rook.getIndex(), destIndex);
  }

  #handlePawnMove(pawn: Pawn, destIndex: number, promotionType: PromotedPieceType = "Q"): void {
    const board = pawn.getBoard();
    const srcIndex = pawn.getIndex();

    if (getRank(destIndex) === Piece.START_RANKS[pawn.oppositeColor]) {
      const pieceType = Piece.pieceClassesByInitial.get(promotionType);
      board.set(
        destIndex,
        Reflect.construct(pieceType, [pawn.color]).setBoard(board).setIndex(destIndex)
      );
      board.delete(srcIndex);
      return;
    }

    if (destIndex === board.getEnPassantIndex()) {
      console.log({ COORDS: { x: pawn.getCoords().x, y: getFile(destIndex) } });
      board.delete(coordsToIndex(pawn.getCoords().x, getFile(destIndex)));
    }

    board.transfer(srcIndex, destIndex);
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
    const rookSrcIndex = (board.get(destIndex) instanceof Rook)
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
      (this.board.get(srcIndex) as Piece) instanceof Pawn
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
    const isSrcPiecePawn = srcPiece instanceof Pawn,
      isCaptureOrPawnMove = !!destPiece || isSrcPiecePawn;

    if (destPiece instanceof Rook && destPiece.isOnInitialSquare(castlingRights))
      castlingRights.unset(destPiece.color, destPiece.getCoords().y);

    switch (true) {
      case isSrcPiecePawn:
        this.#handlePawnMove(srcPiece as Pawn, destIndex, promotionType);
        break;
      case srcPiece instanceof King:
        this.#handleKingMove(srcPiece, destIndex, castlingRights);
        break;
      case srcPiece instanceof Rook:
        this.#handleRookMove(srcPiece as Rook, destIndex, castlingRights);
        break;
      default:
        board.transfer(srcIndex, destIndex);
    }

    return new (<typeof Position>this.constructor)({
      board,
      castlingRights,
      enPassantIndex: (isSrcPiecePawn && Math.abs(destIndex - srcIndex) === 8 * 2)
        ? (srcIndex + destIndex) / 2
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