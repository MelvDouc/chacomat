import Board from "@/board/Board.ts";
import Color from "@/board/Color.ts";
import Coords, { coords } from "@/board/Coords.ts";
import CastlingRights from "@/game/CastlingRights.ts";
import CastlingMove from "@/moves/CastlingMove.ts";
import EnPassantPawnMove from "@/moves/EnPassantPawnMove.ts";
import PawnMove from "@/moves/PawnMove.ts";
import PieceMove from "@/moves/PieceMove.ts";
import Piece from "@/pieces/Piece.ts";
import { JSONPosition, Move, PositionConstructorArgs } from "@/typings/types.ts";

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
  comment?: string;
  srcMove?: Move;
  #prev: Position | null = null;
  readonly #next: Position[] = [];
  #isCheck!: boolean;
  #legalMoves!: Move[];

  constructor({ activeColor, board, castlingRights, enPassantCoords, halfMoveClock, fullMoveNumber }: PositionConstructorArgs) {
    this.board = board;
    this.activeColor = activeColor;
    this.castlingRights = castlingRights;
    this.enPassantCoords = enPassantCoords;
    this.halfMoveClock = halfMoveClock;
    this.fullMoveNumber = fullMoveNumber;
  }

  get prev() {
    return this.#prev;
  }

  set prev(position: Position | null) {
    this.#prev = position;
  }

  get next() {
    return this.#next;
  }

  addNext(posArgs: PositionConstructorArgs & { srcMove: Move; }) {
    for (const pos of this.#next) {
      if (
        pos.srcMove?.srcCoords === posArgs.srcMove.srcCoords
        && pos.srcMove.destCoords === posArgs.srcMove.destCoords
      )
        return pos;
    }

    const nextPosition = new Position(posArgs);
    nextPosition.srcMove = posArgs.srcMove;
    nextPosition.#prev = this;
    this.#next.push(nextPosition);
    return nextPosition;
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
    let current: Position | null | undefined = this.#prev?.prev;
    let count = 1;

    while (current && count < 3) {
      if (current.board.pieces.size !== this.board.pieces.size)
        return false;

      let isSameBoard = true;

      for (const [srcCoords, srcPiece] of this.board.pieces) {
        if (current.board.get(srcCoords) !== srcPiece) {
          isSameBoard = false;
          break;
        }
      }

      if (isSameBoard) count++;
      current = current.prev?.prev;
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
    return !this.#prev
      || this.#prev.isMainLine() && this.#prev.next.indexOf(this) === 0;
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

  toMoveList(varCoords = 0, addMoveNumber = false): string {
    if (!this.#next.length)
      return "";

    const nextPos = this.#next[varCoords];
    const srcMove = nextPos.srcMove!;
    let notation = srcMove.algebraicNotation(this.board, this.legalMoves) + srcMove.getCheckSign(nextPos);

    if (this.comment)
      notation += ` { ${this.comment} }`;

    if (this.activeColor === Color.WHITE)
      notation = `${this.fullMoveNumber}.${notation}`;
    else if (addMoveNumber)
      notation = `${this.fullMoveNumber}...${notation}`;

    if (varCoords === 0)
      for (let i = 1; i < this.#next.length; i++)
        notation += ` ( ${this.toMoveList(i, true)} )`;

    const next = nextPos.toMoveList(0, this.#next.length > 1 && !addMoveNumber);
    if (next) notation += ` ${next}`;
    return notation;
  }

  toJSON() {
    const json: JSONPosition = {
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

  // ===== ===== ===== ===== =====
  // PRIVATE
  // ===== ===== ===== ===== =====

  *#forwardPawnMoves(srcCoords: Coords) {
    const destCoords = srcCoords.peer(this.activeColor.direction, 0);

    if (destCoords && !this.board.has(destCoords)) {
      yield new PawnMove(srcCoords, destCoords);

      if (srcCoords.x === this.activeColor.pawnRank) {
        const destCoords = srcCoords.peer(this.activeColor.direction * 2, 0);

        if (destCoords && !this.board.has(destCoords))
          yield new PawnMove(srcCoords, destCoords);
      }
    }
  }

  *#pawnCaptures(srcCoords: Coords) {
    for (const destCoords of this.board.attackedCoords(srcCoords)) {
      if (this.board.get(destCoords)?.color === this.activeColor.opposite) {
        yield new PawnMove(srcCoords, destCoords);
        continue;
      }

      if (destCoords === this.enPassantCoords)
        yield new EnPassantPawnMove(srcCoords, destCoords);
    }
  }

  *#pseudoLegalMoves() {
    for (const [srcCoords, srcPiece] of this.board.piecesOfColor(this.activeColor)) {
      if (srcPiece.isPawn()) {
        yield* this.#forwardPawnMoves(srcCoords);
        yield* this.#pawnCaptures(srcCoords);
        continue;
      }

      for (const destCoords of this.board.attackedCoords(srcCoords))
        if (this.board.get(destCoords)?.color !== this.activeColor)
          yield new PieceMove(srcCoords, destCoords);
    }
  }

  *#castlingMoves() {
    if (this.isCheck()) return;
    const kingCoords = this.board.getKingCoords(this.activeColor);
    const attackedCoords = new Set<Coords>();

    for (const rookSrcY of this.castlingRights.get(this.activeColor)) {
      if (!attackedCoords.size) {
        for (const [srcCoords] of this.board.piecesOfColor(this.activeColor.opposite))
          for (const destCoords of this.board.attackedCoords(srcCoords))
            attackedCoords.add(destCoords);
      }

      const rookSrcCoords = coords(kingCoords.x, rookSrcY);
      const move = new CastlingMove(kingCoords, coords(kingCoords.x, rookSrcY === 0 ? 2 : 6), rookSrcCoords);

      if (move.isLegal(this.board, attackedCoords))
        yield move;
    }
  }

  #computeLegalMoves() {
    const legalMoves: Move[] = [];

    for (const move of this.#pseudoLegalMoves()) {
      const isPromotion = move instanceof PawnMove && move.isPromotion(this.board);
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