import { ReversedColor } from "@chacomat/constants/Color.js";
import Board from "@chacomat/game/Board.js";
import CastlingRights from "@chacomat/game/CastlingRights.js";
import Piece from "@chacomat/pieces/index.js";
import type {
  AlgebraicSquareNotation, ChessGame,
  Color,
  FenString,
  Move,
  Pawn,
  PositionParameters,
  PromotedPieceType,
  Queen,
  Rook
} from "@chacomat/types.local.js";
import Coords from "@chacomat/utils/Coords.js";
import { InvalidFenError } from "@chacomat/utils/errors.js";
import fenChecker from "@chacomat/utils/fen-checker.js";

/**
 * @classdesc An instance of this class is an immutable description of a position in a game. Its status cannot be altered.
 */
export default class Position {
  static readonly startFenString: FenString = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  static readonly CastlingRights: typeof CastlingRights = CastlingRights;
  static readonly Board: typeof Board = Board;

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
      board: this.Board.fromString(pieceStr),
      colorToMove,
      castlingRights: this.CastlingRights.fromString(castlingStr),
      enPassantY: (enPassant === fenChecker.nullCharacter)
        ? -1
        : Coords.fromNotation(enPassant as AlgebraicSquareNotation).y,
      halfMoveClock: +halfMoveClock,
      fullMoveNumber: +fullMoveNumber
    });
  }

  readonly board: Board;
  readonly castlingRights: CastlingRights;
  readonly colorToMove: Color;
  readonly halfMoveClock: number;
  readonly fullMoveNumber: number;
  #legalMoves: Move[];
  game: ChessGame;
  prev: Position | null = null;
  next: Position[] = [];

  constructor({ board, castlingRights, colorToMove, enPassantY, halfMoveClock, fullMoveNumber }: PositionParameters) {
    board.enPassantY = enPassantY;
    this.board = board;
    this.castlingRights = castlingRights;
    this.colorToMove = colorToMove;
    this.halfMoveClock = halfMoveClock;
    this.fullMoveNumber = fullMoveNumber;
    this.board.position = this;
  }

  // ===== ===== ===== ===== =====
  // STATUS
  // ===== ===== ===== ===== =====

  isCheck(): boolean {
    const { coords, oppositeColor } = this.board.kings[this.colorToMove];
    return this.board.getCoordsAttackedByColor(oppositeColor).has(coords);
  }

  isInsufficientMaterial(): boolean {
    if (this.board.size > 4)
      return false;

    const nonKingPieces = [...this.board.values()].reduce((acc, piece) => {
      if (!piece.isKing())
        acc[piece.color].push(piece);
      return acc;
    }, {
      WHITE: [] as Piece[],
      BLACK: [] as Piece[]
    });

    const [whitePiece] = nonKingPieces.WHITE;
    const [blackPiece] = nonKingPieces.BLACK;

    if (!whitePiece)
      return !blackPiece || blackPiece.isBishop() || blackPiece.isKnight();

    if (whitePiece.isBishop())
      return !blackPiece
        || (blackPiece.isBishop()) && whitePiece.colorComplex === blackPiece.colorComplex;

    if (whitePiece.isKnight())
      return !blackPiece || blackPiece.isKnight();

    return false;
  }

  // ===== ===== ===== ===== =====
  // LEGAL MOVES
  // ===== ===== ===== ===== =====

  get legalMoves(): Move[] {
    if (this.#legalMoves)
      return this.#legalMoves;

    const legalMoves: Move[] = [];
    const entries = [...this.board.entries()];

    for (const [srcCoords, piece] of entries) {
      if (piece.color !== this.colorToMove)
        continue;

      for (const destCoords of piece.pseudoLegalMoves()) {
        const capturedPiece = piece.isPawn() && piece.isEnPassantCapture(destCoords)
          ? this.board.atX(srcCoords.x).atY(destCoords.y)
          : this.board.get(destCoords);

        capturedPiece && this.board.delete(capturedPiece.coords);
        this.board.set(destCoords, piece).delete(srcCoords);
        piece.coords = destCoords;

        if (!this.isCheck())
          legalMoves.push([srcCoords, destCoords]);

        this.board.set(srcCoords, piece).delete(destCoords);
        piece.coords = srcCoords;
        capturedPiece && this.board.set(capturedPiece.coords, capturedPiece);
      }
    }

    if (!this.isCheck()) {
      const king = this.board.kings[this.colorToMove];
      for (const destCoords of this.castlingCoords())
        legalMoves.push([king.coords, destCoords]);
    }

    return (this.#legalMoves = legalMoves);
  }

  /**
   * @returns A human-readable array of moves as strings following the pattern `e2-e4`.
   */
  get legalMovesAsNotation(): string[] {
    return this.legalMoves.map(([srcCoords, destCoords]) => {
      return `${srcCoords.notation}-${destCoords.notation}`;
    });
  }

  /**
   * A different method is used in Chess960 to determine if a move is castling.
   */
  isCastling(king: Piece, destCoords: Coords): boolean {
    return Math.abs(destCoords.y - king.y) === 2;
  }

  *castlingCoords() {
    yield* this.board.kings[this.colorToMove].castlingCoords(false);
  }

  // ===== ===== ===== ===== =====
  // PIECE MOVES
  // ===== ===== ===== ===== =====

  #handleRookMove(rook: Rook, destCoords: Coords, castlingRights: CastlingRights): void {
    if (rook.isOnStartRank() && castlingRights[rook.color].includes(rook.y))
      castlingRights.unset(rook.color, rook.y);
    rook.board.transfer(rook.coords, destCoords);
  }

  #handlePawnMove(pawn: Pawn, destCoords: Coords, promotionType: PromotedPieceType = "Q"): void {
    const board = pawn.board;
    const srcCoords = pawn.coords;

    if (destCoords.x === Piece.START_RANKS[pawn.oppositeColor]) {
      const promotedPiece = new (Piece.pieceClassesByInitial.get(promotionType) as typeof Queen)(pawn.color);
      promotedPiece.coords = destCoords;
      promotedPiece.board = board;
      board.set(destCoords, promotedPiece).delete(srcCoords);
      return;
    }

    if (pawn.isEnPassantCapture(destCoords)) {
      const enPassantPawnCoords = Coords.get(srcCoords.x, destCoords.y);
      board.delete(enPassantPawnCoords);
    }

    board.transfer(srcCoords, destCoords);
  }

  #handleKingMove(king: Piece, destCoords: Coords, castlingRights: CastlingRights): void {
    castlingRights[king.color].length = 0;

    if (!this.isCastling(king, destCoords)) {
      king.board.transfer(king.coords, destCoords);
      return;
    }

    this.#castle(king, destCoords);
  }

  #castle(king: Piece, destCoords: Coords): void {
    const board = king.board;
    const srcCoords = king.coords;
    const wing = (destCoords.y < srcCoords.y) ? 0 : 7;
    // These are distinct from `destCoords` as the latter may point to a same-colored rook in the case of castling.
    const kingDestCoords = Coords.get(srcCoords.x, Piece.CASTLED_KING_FILES[wing]);
    const rookSrcCoords = (board.get(destCoords)?.isRook())
      ? destCoords
      : Coords.get(destCoords.x, wing);
    const rookDestCoords = Coords.get(srcCoords.x, Piece.CASTLED_ROOK_FILES[wing]);

    board
      .transfer(srcCoords, kingDestCoords)
      .transfer(rookSrcCoords, rookDestCoords);
  }

  /**
   * The color to move isn't updated just yet as this position will be used
   * to verify if a move has put the currently active color in check.
   */
  createPositionFromMove(
    srcCoords: Coords,
    destCoords: Coords,
    promotionType: PromotedPieceType = "Q"
  ): Position {
    const board = this.board.clone();
    const castlingRights = this.castlingRights.clone();
    const srcPiece = board.get(srcCoords) as Piece;
    const destPiece = board.get(destCoords);
    const isSrcPiecePawn = srcPiece.isPawn();
    const isCaptureOrPawnMove = isSrcPiecePawn || !!destPiece;

    if (
      destPiece?.isRook()
      && destPiece.isOnStartRank()
      && castlingRights[destPiece.color].includes(destPiece.y)
    )
      castlingRights.unset(destPiece.color, destPiece.y);

    if (isSrcPiecePawn)
      this.#handlePawnMove(srcPiece as Pawn, destCoords, promotionType);
    else if (srcPiece.isKing())
      this.#handleKingMove(srcPiece, destCoords, castlingRights);
    else if (srcPiece.isRook())
      this.#handleRookMove(srcPiece as Rook, destCoords, castlingRights);
    else
      board.transfer(srcCoords, destCoords);

    return new (<typeof Position>this.constructor)({
      board,
      castlingRights,
      enPassantY: (isSrcPiecePawn && Math.abs(destCoords.x - srcCoords.x) === 2)
        ? destCoords.y
        : -1,
      colorToMove: ReversedColor[this.colorToMove],
      halfMoveClock: (isCaptureOrPawnMove) ? 0 : this.halfMoveClock + 1,
      fullMoveNumber: this.fullMoveNumber + Number(this.colorToMove === "BLACK")
    });
  }

  // ===== ===== ===== ===== =====
  // MISC
  // ===== ===== ===== ===== =====

  /**
   * @returns The FEN string of this position.
   */
  toString(): FenString {
    const enPassantX = this.colorToMove === "WHITE" ? 6 : 3;

    return [
      this.board.toString(),
      (this.colorToMove === "WHITE") ? "w" : "b",
      this.castlingRights.toString(),
      (this.board.enPassantY === -1)
        ? fenChecker.nullCharacter
        : Coords.get(enPassantX, this.board.enPassantY).notation,
      String(this.halfMoveClock),
      String(this.fullMoveNumber)
    ].join(" ");
  }
}