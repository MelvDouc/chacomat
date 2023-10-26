import Board from "@/board/Board.ts";
import Color from "@/board/Color.ts";
import Coords from "@/board/Coords.ts";
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
    return this.legalMoves.map((move) => move.algebraicNotation(this));
  }

  isCheck() {
    return this.#isCheck ??= this.board.isColorInCheck(this.activeColor);
  }

  isCheckmate() {
    return this.isCheck() && this.legalMoves.length === 0;
  }

  isStalemate() {
    return !this.isCheck() && this.legalMoves.length === 0;
  }

  isTripleRepetition() {
    let pos: Position | null | undefined = this.prev?.prev;
    let count = 1;

    main: while (pos && count < 3) {
      if (pos.board.pieces.size !== this.board.pieces.size)
        return false;

      for (const [coords, piece] of this.board.pieces) {
        if (pos.board.get(coords) !== piece) {
          pos = pos.prev?.prev;
          continue main;
        }
      }

      count++;
      pos = pos.prev?.prev;
    }

    return count === 3;
  }

  isInsufficientMaterial() {
    if (this.board.pieces.size > 4)
      return false;

    const knightOrBishopCoords = {
      [this.activeColor.name]: [] as ChacoMat.Coords[],
      [this.activeColor.opposite.name]: [] as ChacoMat.Coords[]
    };

    for (const [coords, piece] of this.board.pieces) {
      if (piece.isKing()) continue;
      if (!piece.isBishop() && !piece.isKnight())
        return false;
      knightOrBishopCoords[piece.color.name].push(coords);
    }

    const [minCoords, maxCoords] = Object.values(knightOrBishopCoords).sort((a, b) => a.length - b.length);

    return maxCoords.length === 0
      || maxCoords.length === 1 && (
        minCoords.length === 0 || (
          this.board.get(maxCoords[0])!.isBishop()
          && this.board.get(minCoords[0])!.isBishop()
          && minCoords[0].isLightSquare() === maxCoords[0].isLightSquare()
        )
      );
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
        yield new EnPassantPawnMove(srcCoords, destCoords, pawn);
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
    const kingCoords = this.board.getKingCoords(this.activeColor);
    const attackedCoordsSet = this.board.getAttackedCoordsSet(this.activeColor.opposite);
    if (attackedCoordsSet.has(kingCoords)) return;

    for (const rookSrcX of this.castlingRights.get(this.activeColor)) {
      const move = new CastlingMove(kingCoords, rookSrcX, this.activeColor);

      if (move.isLegal(this.board, attackedCoordsSet))
        yield move;
    }
  }

  #computeLegalMoves() {
    const legalMoves = this.#getPseudoLegalMoves().reduce((acc, move) => {
      move.play(this.board);

      if (!this.board.isColorInCheck(this.activeColor)) {
        if (move instanceof PawnMove && move.isPromotion())
          acc.push(...move.promotions());
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