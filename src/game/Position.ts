import Board from "@/board/Board.ts";
import Color from "@/board/Color.ts";
import Coords from "@/board/Coords.ts";
import CastlingRights from "@/game/CastlingRights.ts";
import CastlingMove from "@/moves/CastlingMove.ts";
import EnPassantPawnMove from "@/moves/EnPassantPawnMove.ts";
import PawnMove from "@/moves/PawnMove.ts";
import PieceMove from "@/moves/PieceMove.ts";
import Piece from "@/pieces/Piece.ts";
import { ChacoMat } from "@/typings/chacomat.ts";
import MoveList from "@/utils/MoveList.ts";

export default class Position {
  // ===== ===== ===== ===== =====
  // STATIC PUBLIC
  // ===== ===== ===== ===== =====

  static readonly START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w kqKQ - 0 1";

  static fromFEN(fen: string) {
    const [boardStr, clr, castling, enPassant, halfMoveClock, fullMoveNumber] = fen.split(" ");

    return new this({
      board: Board.fromString(boardStr),
      activeColor: Color.fromAbbreviation(clr),
      castlingRights: CastlingRights.fromString(castling),
      enPassantCoords: Coords.fromNotation(enPassant),
      halfMoveClock: Number(halfMoveClock),
      fullMoveNumber: Number(fullMoveNumber)
    });
  }

  // ===== ===== ===== ===== =====
  // STATIC PRIVATE
  // ===== ===== ===== ===== =====

  static readonly #promotionInitials = {
    [Color.WHITE.name]: ["Q", "R", "B", "N"],
    [Color.BLACK.name]: ["q", "r", "b", "n"]
  };

  // ===== ===== ===== ===== =====
  // PUBLIC
  // ===== ===== ===== ===== =====

  readonly board: Board;
  readonly activeColor: Color;
  readonly castlingRights: CastlingRights;
  readonly enPassantCoords: Coords | null;
  readonly halfMoveClock: number;
  readonly fullMoveNumber: number;
  prev: Position | null = null;
  readonly next: Position[] = [];
  srcMove?: ChacoMat.Move;
  comment?: string;
  #isCheck!: boolean;
  #legalMoves!: ChacoMat.Move[];

  constructor({ activeColor, board, castlingRights, enPassantCoords, halfMoveClock, fullMoveNumber }: ChacoMat.PositionConstructorArgs) {
    this.board = board;
    this.activeColor = activeColor;
    this.castlingRights = castlingRights;
    this.enPassantCoords = enPassantCoords;
    this.halfMoveClock = halfMoveClock;
    this.fullMoveNumber = fullMoveNumber;
  }

  get legalMoves() {
    return this.#legalMoves ??= this.#computeLegalMoves();
  }

  get legalMovesAsAlgebraicNotation() {
    return this.legalMoves.map((move) => move.algebraicNotation(this.board, this.legalMoves));
  }

  isCheck() {
    return this.#isCheck ??= this.board.isColorInCheck(this.activeColor);
  }

  isCheckmate() {
    return this.isCheck() && !this.legalMoves.length;
  }

  isStalemate() {
    return !this.isCheck() && !this.legalMoves.length;
  }

  isTripleRepetition() {
    let current: Position | null | undefined = this.prev?.prev;
    let count = 1;
    let isSameBoard = true;

    while (
      current
      && current.board.pieces.size === this.board.pieces.size
      && count < 3
    ) {
      for (const [srcCoords, srcPiece] of this.board.pieces) {
        if (current.board.get(srcCoords) !== srcPiece) {
          isSameBoard = false;
          break;
        }
      }

      if (isSameBoard) count++;
      current = current.prev?.prev;
      isSameBoard = true;
    }

    return count === 3;
  }

  isInsufficientMaterial() {
    if (this.board.pieces.size > 4)
      return false;

    const nonKingPieces = this.board.nonKingPieces();
    const activePieces = nonKingPieces.get(this.activeColor)!;
    const inactivePieces = nonKingPieces.get(this.activeColor.opposite)!;
    const [inactiveCoords0, inactivePiece0] = inactivePieces[0] ?? [];

    if (activePieces.length === 0)
      return inactivePieces.length === 0
        || inactivePieces.length === 1 && (inactivePiece0.isKnight() || inactivePiece0.isBishop());

    if (activePieces.length === 1) {
      const [activeCoords0, activePiece0] = activePieces[0];
      if (inactivePieces.length === 0)
        return activePiece0.isKnight() || activePiece0.isBishop();
      return inactivePieces.length === 1
        && activePiece0.isBishop()
        && inactivePiece0.isBishop()
        && activeCoords0.isLightSquare() === inactiveCoords0.isLightSquare();
    }

    return false;
  }

  isMainLine(): boolean {
    return !this.prev
      || this.prev.isMainLine() && this.prev.next[0] === this;
  }

  toString() {
    return this.toFEN();
  }

  toFEN() {
    return [
      this.board.toString(),
      this.activeColor.abbreviation,
      this.castlingRights.toString(),
      this.enPassantCoords?.notation ?? "-",
      this.halfMoveClock,
      this.fullMoveNumber
    ].join(" ");
  }

  toJSON() {
    const json: ChacoMat.JSONPosition = {
      board: this.board.toArray(),
      activeColor: this.activeColor.name,
      fullMoveNumber: this.fullMoveNumber,
      halfMoveClock: this.halfMoveClock,
      enPassantCoords: this.enPassantCoords,
      castlingRights: {
        [Color.WHITE.name]: [...this.castlingRights.get(Color.WHITE)],
        [Color.BLACK.name]: [...this.castlingRights.get(Color.BLACK)]
      }
    };
    if (this.comment) json.comment = this.comment;
    return json;
  }

  toMoveList() {
    return new MoveList(this);
  }

  // ===== ===== ===== ===== =====
  // PRIVATE
  // ===== ===== ===== ===== =====

  *#forwardPawnMoves(srcCoords: Coords) {
    const destCoords = srcCoords.peer(0, this.activeColor.direction);

    if (destCoords && !this.board.has(destCoords)) {
      yield new PawnMove(srcCoords, destCoords);

      if (srcCoords.y === this.board.getPawnRank(this.activeColor)) {
        const destCoords = srcCoords.peer(0, this.activeColor.direction * 2);

        if (destCoords && !this.board.has(destCoords))
          yield new PawnMove(srcCoords, destCoords);
      }
    }
  }

  *#pawnCaptures(srcCoords: Coords) {
    const piece = this.board.get(srcCoords)!;

    for (const destCoords of piece.attackedCoords(this.board, srcCoords)) {
      if (this.board.get(destCoords)?.color === this.activeColor.opposite) {
        yield new PawnMove(srcCoords, destCoords);
        continue;
      }

      if (destCoords === this.enPassantCoords)
        yield new EnPassantPawnMove(srcCoords, destCoords);
    }
  }

  *#pseudoLegalMoves() {
    for (const [srcCoords, piece] of this.board.piecesOfColor(this.activeColor)) {
      if (piece.isPawn()) {
        yield* this.#forwardPawnMoves(srcCoords);
        yield* this.#pawnCaptures(srcCoords);
        continue;
      }

      for (const destCoords of piece.attackedCoords(this.board, srcCoords))
        if (this.board.get(destCoords)?.color !== this.activeColor)
          yield new PieceMove(srcCoords, destCoords);
    }
  }

  *#castlingMoves() {
    if (this.isCheck()) return;

    const { activeColor, board, castlingRights } = this;
    const kingCoords = board.getKingCoords(activeColor);
    const attackedCoords = board.attackedCoordsSet(activeColor.opposite);

    for (const rookSrcX of castlingRights.get(activeColor)) {
      const move = new CastlingMove(kingCoords, rookSrcX);

      if (move.isLegal(board, attackedCoords))
        yield move;
    }
  }

  #computeLegalMoves() {
    const legalMoves: ChacoMat.Move[] = [];

    for (const move of this.#pseudoLegalMoves()) {
      const isPromotion = move instanceof PawnMove && move.isPromotion();
      const undo = move.try(this.board);

      if (!this.board.isColorInCheck(this.activeColor)) {
        if (isPromotion)
          Position.#promotionInitials[this.activeColor.name].forEach((initial) => {
            legalMoves.push(
              new PawnMove(move.srcCoords, move.destCoords, Piece.fromInitial(initial))
            );
          });
        else
          legalMoves.push(move);
      }

      undo();
    }

    legalMoves.push(...this.#castlingMoves());
    return legalMoves;
  }
}