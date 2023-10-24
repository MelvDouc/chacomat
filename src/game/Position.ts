import Board from "@/board/Board.ts";
import Color from "@/board/Color.ts";
import Coords, { coords } from "@/board/Coords.ts";
import CastlingRights from "@/game/CastlingRights.ts";
import CastlingMove from "@/moves/CastlingMove.ts";
import EnPassantPawnMove from "@/moves/EnPassantPawnMove.ts";
import PawnMove from "@/moves/PawnMove.ts";
import PieceMove from "@/moves/PieceMove.ts";
import { ChacoMat } from "@/typings/chacomat.ts";
import { getMoveTree, stringifyMoveTree } from "@/utils/move-tree.ts";

export default class Position {
  // ===== ===== ===== ===== =====
  // STATIC PUBLIC
  // ===== ===== ===== ===== =====

  static readonly START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w kqKQ - 0 1";

  static fromFEN(fen: string) {
    const [boardStr, clr, castling, enPassant, halfMoveClock, fullMoveNumber] = fen.split(" ");

    return new this(
      Board.fromString(boardStr),
      Color.fromAbbreviation(clr),
      CastlingRights.fromString(castling),
      Coords.fromNotation(enPassant),
      Number(halfMoveClock),
      Number(fullMoveNumber)
    );
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

  prev: Position | null = null;
  readonly next: Position[] = [];
  srcMove?: ChacoMat.Move;
  comment?: string;
  #isCheck!: boolean;
  #legalMoves!: ChacoMat.Move[];

  constructor(
    readonly board: Board,
    readonly activeColor: Color,
    readonly castlingRights: CastlingRights,
    readonly enPassantCoords: Coords | null,
    readonly halfMoveClock: number,
    readonly fullMoveNumber: number
  ) { }

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
    let prevPos: Position | null | undefined = this.prev?.prev;
    let count = 1;

    main: while (prevPos && count < 3) {
      if (prevPos.board.pieces.size !== this.board.pieces.size)
        return false;

      for (const [coords, piece] of this.board.pieces) {
        if (prevPos.board.get(coords) !== piece) {
          prevPos = prevPos.prev?.prev;
          continue main;
        }
      }

      count++;
      prevPos = prevPos.prev?.prev;
    }

    return count === 3;
  }

  isInsufficientMaterial() {
    if (this.board.pieces.size > 4)
      return false;

    const activeEntries: { coords: ChacoMat.Coords; piece: ChacoMat.Piece; }[] = [];
    const inactiveEntries: typeof activeEntries = [];

    for (const [coords, piece] of this.board.pieces) {
      if (piece.isKing()) continue;
      const arr = (piece.color === this.activeColor) ? activeEntries : inactiveEntries;
      arr.push({ coords, piece });
    }

    const [minEntries, maxEntries] = [activeEntries, inactiveEntries].sort((a, b) => a.length - b.length);

    if (maxEntries.length === 1) {
      const { coords: maxCoords, piece: maxPiece } = maxEntries[0];

      if (minEntries.length === 0)
        return maxPiece.isKnight() || maxPiece.isBishop();

      return maxPiece.isBishop()
        && minEntries[0].piece.isBishop()
        && minEntries[0].coords.isLightSquare() === maxCoords.isLightSquare();
    }

    return maxEntries.length === 0;
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

  toTree() {
    const tree = getMoveTree(this);
    if (!tree) return null;
    return {
      ...tree,
      toString: () => stringifyMoveTree(tree)
    };
  }

  // ===== ===== ===== ===== =====
  // PRIVATE
  // ===== ===== ===== ===== =====

  *#forwardPawnMoves(srcCoords: Coords) {
    const pawn = this.board.get(srcCoords)!;
    const destCoords = srcCoords.peer(0, this.activeColor.direction) as ChacoMat.Coords;

    if (!this.board.has(destCoords)) {
      yield new PawnMove(srcCoords, destCoords, pawn, null);

      if (srcCoords.y === this.activeColor.pawnRank) {
        const destCoords = srcCoords.peer(0, this.activeColor.direction * 2) as ChacoMat.Coords;

        if (!this.board.has(destCoords))
          yield new PawnMove(srcCoords, destCoords, pawn, null);
      }
    }
  }

  *#pawnCaptures(srcCoords: Coords) {
    const pawn = this.board.get(srcCoords)!;

    for (const destCoords of pawn.attackedCoords(this.board, srcCoords)) {
      if (this.board.get(destCoords)?.color === this.activeColor.opposite) {
        yield new PawnMove(srcCoords, destCoords, pawn, this.board.get(destCoords));
        continue;
      }

      if (destCoords === this.enPassantCoords)
        yield new EnPassantPawnMove(srcCoords, destCoords, pawn, coords[destCoords.x][srcCoords.y]);
    }
  }

  #getPseudoLegalMoves() {
    const moves: ChacoMat.Move[] = [];

    for (const [srcCoords, piece] of this.board.pieces) {
      if (piece.color !== this.activeColor) continue;

      if (piece.isPawn()) {
        moves.push(...this.#forwardPawnMoves(srcCoords), ...this.#pawnCaptures(srcCoords));
        continue;
      }

      for (const destCoords of piece.attackedCoords(this.board, srcCoords))
        if (this.board.get(destCoords)?.color !== this.activeColor)
          moves.push(new PieceMove(srcCoords, destCoords, piece, this.board.get(destCoords)));
    }

    return moves;
  }

  *#castlingMoves() {
    if (this.isCheck()) return;

    const kingCoords = this.board.getKingCoords(this.activeColor);
    const attackedCoords = this.board.attackedCoordsSet(this.activeColor.opposite);

    for (const rookSrcX of this.castlingRights.get(this.activeColor)) {
      const move = new CastlingMove(kingCoords, rookSrcX, this.activeColor);

      if (move.isLegal(this.board, attackedCoords))
        yield move;
    }
  }

  #computeLegalMoves() {
    const legalMoves = this.#getPseudoLegalMoves().reduce((acc, move) => {
      move.play(this.board);

      if (!this.board.isColorInCheck(this.activeColor)) {
        if (move instanceof PawnMove && move.isPromotion())
          acc.push(...move.promotions(Position.#promotionInitials[this.activeColor.name]));
        else
          acc.push(move);
      }

      move.undo(this.board);
      return acc;
    }, [] as ChacoMat.Move[]);

    legalMoves.push(...this.#castlingMoves());
    return legalMoves;
  }
}