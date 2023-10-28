import Board from "@/board/Board.ts";
import Color from "@/board/Color.ts";
import Coords from "@/coordinates/Coords.ts";
import CastlingRights from "@/game/CastlingRights.ts";
import CastlingMove from "@/moves/CastlingMove.ts";
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
    return this.#legalMoves ??= [...this.generateLegalMoves()];
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
      enPassantCoords: this.enPassantCoords?.toJSON() ?? null,
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

  /**
   * Clone this position with colors reversed and its board mirrored vertically.
   */
  reverse() {
    return new Position(
      this.board.mirror({ vertical: true, colors: true }),
      this.activeColor.opposite,
      new CastlingRights([...this.castlingRights.get(Color.BLACK)], [...this.castlingRights.get(Color.WHITE)]),
      this.enPassantCoords
        ? Coords.ALL[this.enPassantCoords.x][this.enPassantCoords.y + this.activeColor.direction * -3]
        : null,
      this.halfMoveClock,
      this.fullMoveNumber
    );
  }

  *pseudoLegalMoves() {
    /**
     * The map has to be spread to avoid an infinite loop
     * as set/delete operations will occur while iterating.
     */
    for (const [srcCoords, piece] of [...this.board.pieces]) {
      if (piece.color !== this.activeColor) continue;

      if (piece.isPawn()) {
        yield* this.#forwardPawnMoves(srcCoords);
        yield* this.#pawnCaptures(srcCoords);
        continue;
      }

      for (const destCoords of piece.getAttackedCoords(this.board, srcCoords))
        if (this.board.get(destCoords)?.color !== this.activeColor)
          yield new PieceMove(srcCoords, destCoords, piece, this.board.get(destCoords));
    }
  }

  *castlingMoves() {
    const kingCoords = this.board.getKingCoords(this.activeColor);
    const attackedCoordsSet = this.board.getAttackedCoordsSet(this.activeColor.opposite);
    if (attackedCoordsSet.has(kingCoords)) return;

    for (const rookSrcX of this.castlingRights.get(this.activeColor)) {
      const move = new CastlingMove(kingCoords, rookSrcX, this.activeColor);

      if (move.isLegal(this.board, attackedCoordsSet))
        yield move;
    }
  }

  *generateLegalMoves() {
    for (const move of this.pseudoLegalMoves()) {
      move.play(this.board);
      const isLegal = !this.board.isColorInCheck(this.activeColor);
      move.undo(this.board);

      if (isLegal) {
        if (move instanceof PawnMove && move.isPromotion())
          yield* move.promotions();
        else
          yield move;
      }
    }

    yield* this.castlingMoves();
  }

  // ===== ===== ===== ===== =====
  // PRIVATE
  // ===== ===== ===== ===== =====

  *#forwardPawnMoves(srcCoords: Coords) {
    const pawn = this.board.get(srcCoords)!;
    const destCoords = Coords.ALL[srcCoords.x][srcCoords.y + this.activeColor.direction];

    if (!this.board.has(destCoords)) {
      yield new PawnMove(srcCoords, destCoords, pawn, null, false);

      if (srcCoords.y === this.activeColor.pawnRank) {
        const destCoords = Coords.ALL[srcCoords.x][srcCoords.y + this.activeColor.direction * 2];

        if (!this.board.has(destCoords))
          yield new PawnMove(srcCoords, destCoords, pawn, null, false);
      }
    }
  }

  *#pawnCaptures(srcCoords: Coords) {
    const pawn = this.board.get(srcCoords)!;

    for (const destCoords of pawn.getAttackedCoords(this.board, srcCoords)) {
      if (this.board.get(destCoords)?.color === this.activeColor.opposite) {
        yield new PawnMove(srcCoords, destCoords, pawn, this.board.get(destCoords), false);
        continue;
      }

      if (destCoords === this.enPassantCoords)
        yield new PawnMove(srcCoords, destCoords, pawn, pawn.opposite, true);
    }
  }
}