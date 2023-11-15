import Colors, { colorAbbreviations } from "$src/constants/Colors.ts";
import SquareIndex, { indexTable, pointTable } from "$src/constants/SquareIndex.ts";
import { BOARD_WIDTH } from "$src/constants/dimensions.ts";
import Board from "$src/game/Board.ts";
import CastlingRights from "$src/game/CastlingRights.ts";
import CastlingMove from "$src/moves/CastlingMove.ts";
import PawnMove from "$src/moves/PawnMove.ts";
import PieceMove from "$src/moves/PieceMove.ts";
import Piece from "$src/pieces/Piece.ts";
import Pieces from "$src/pieces/Pieces.ts";
import { Color, Move, Wing } from "$src/typings/types.ts";

export default class Position {
  static readonly START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w kqKQ - 0 1";

  static fromFEN(fen: string) {
    const [boardString, color, castlingString, enPassant, halfMoveClock, fullMoveNumber] = fen.split(" ");

    return new this(
      Board.fromString(boardString),
      colorAbbreviations[color as "w" | "b"],
      CastlingRights.fromString(castlingString),
      SquareIndex[enPassant as keyof typeof SquareIndex] ?? null,
      +halfMoveClock,
      +fullMoveNumber
    );
  }

  srcMove: Move | null = null;
  prev: Position | null = null;
  readonly next: Position[] = [];
  comment: string | null = null;
  private _legalMoves?: Move[];
  private _isCheck?: boolean;

  constructor(
    public readonly board: Board,
    public readonly activeColor: Color,
    public readonly castlingRights: CastlingRights,
    public readonly enPassantIndex: SquareIndex | null,
    public readonly halfMoveClock: number,
    public readonly fullMoveNumber: number
  ) { }

  get inactiveColor() {
    return -this.activeColor as Color;
  }

  get legalMoves() {
    return this._legalMoves ??= [...this.generateLegalMoves()];
  }

  get legalMovesAsAlgebraicNotation() {
    return this.legalMoves.map((move) => move.getAlgebraicNotation(this));
  }

  isCheck() {
    return this._isCheck ??= this.board.isKingEnPrise(this.activeColor);
  }

  isCheckmate() {
    return this.isCheck() && this.legalMoves.length === 0;
  }

  isStalemate() {
    return !this.isCheck() && this.legalMoves.length === 0;
  }

  isTripleRepetition() {
    let prevPos: Position | null = this.prev;
    let count = 1;

    while (prevPos && count < 3) {
      if (prevPos.srcMove?.isCapture() || prevPos.srcMove instanceof CastlingMove)
        break;

      if (prevPos.board.equals(this.board))
        count++;

      prevPos = prevPos.prev;
    }

    return count === 3;
  }

  isInsufficientMaterial() {
    const useWhite = this.activeColor === Colors.WHITE;
    const activeB = useWhite ? Pieces.WHITE_BISHOP : Pieces.BLACK_BISHOP;
    const activeN = useWhite ? Pieces.WHITE_KNIGHT : Pieces.BLACK_KNIGHT;
    const inactiveB = activeB.opposite;
    const inactiveN = activeN.opposite;
    const indicesMap = new Map<Piece, SquareIndex[]>();

    for (const [srcIndex, piece] of this.board.getPieces()) {
      if (piece.isKing()) continue;
      if (
        piece !== activeB
        && piece !== activeN
        && piece !== inactiveB
        && piece !== inactiveN
      )
        return false;
      if (!indicesMap.has(piece))
        indicesMap.set(piece, []);
      indicesMap.get(piece)!.push(srcIndex);
    }

    const activeCount = (indicesMap.get(activeB)?.length ?? 0) + (indicesMap.get(activeN)?.length ?? 0);
    const inactiveCount = (indicesMap.get(inactiveB)?.length ?? 0) + (indicesMap.get(inactiveN)?.length ?? 0);

    if (activeCount === 0)
      return inactiveCount === 0;

    if (activeCount > 1)
      return false;

    if (inactiveCount === 0)
      return true;

    if (inactiveCount > 1 || !indicesMap.has(activeB) || !indicesMap.has(inactiveB))
      return false;

    const activePoint = pointTable[indicesMap.get(activeB)![0]];
    const inactivePoint = pointTable[indicesMap.get(inactiveB)![0]];

    return (activePoint.x % 2 === activePoint.y % 2) === (inactivePoint.x % 2 === inactivePoint.y % 2);
  }

  isMainLine(): boolean {
    if (!this.prev)
      return true;

    if (this.prev.next.indexOf(this) !== 0)
      return false;

    return this.prev.isMainLine();
  }

  /**
   * Clone this position with colors reversed and its board mirrored vertically.
   */
  reverse() {
    const castlingRights = new CastlingRights();
    castlingRights.queenSide[Colors.WHITE] = this.castlingRights.queenSide[Colors.BLACK];
    castlingRights.kingSide[Colors.WHITE] = this.castlingRights.kingSide[Colors.BLACK];
    castlingRights.queenSide[Colors.BLACK] = this.castlingRights.queenSide[Colors.WHITE];
    castlingRights.kingSide[Colors.BLACK] = this.castlingRights.kingSide[Colors.WHITE];

    let { enPassantIndex } = this;
    if (enPassantIndex !== null) {
      const { x, y } = pointTable[enPassantIndex];
      enPassantIndex = indexTable[BOARD_WIDTH - y - 1][x];
    }

    return new Position(
      this.board.mirror({ vertically: true, swapColors: true }),
      this.inactiveColor,
      castlingRights,
      enPassantIndex,
      this.halfMoveClock,
      this.fullMoveNumber
    );
  }

  toFEN() {
    return [
      this.board.toString(),
      colorAbbreviations[this.activeColor],
      this.castlingRights.toString(),
      this.enPassantIndex !== null ? SquareIndex[this.enPassantIndex] : "-",
      this.halfMoveClock,
      this.fullMoveNumber
    ].join(" ");
  }

  toMoveString(varIndex = 0, use3Dots = false): string {
    const next = this.next[varIndex];
    if (!next) return "";

    const moveNotation = next.srcMove?.getFullAlgebraicNotation(this, next) ?? "--";
    let moveString = (this.activeColor === Colors.WHITE)
      ? `${this.fullMoveNumber}.${moveNotation}`
      : (use3Dots)
        ? `${this.fullMoveNumber}...${moveNotation}`
        : moveNotation;

    if (this.comment)
      moveString = `{ ${this.comment} } ${moveString}`;

    if (varIndex === 0)
      for (let i = 1; i < this.next.length; i++)
        moveString += ` ( ${this.toMoveString(i, true)} )`;

    const nextNotation = next.toMoveString(0, varIndex === 0 && this.next.length > 1);
    nextNotation && (moveString += ` ${nextNotation}`);
    return moveString;
  }

  toJSON() {
    const data: {
      board: ReturnType<typeof Board.prototype.toArray>;
      activeColor: string;
      castlingRights: Record<Wing, Record<Color, boolean>>;
      enPassantIndex: SquareIndex | null;
      halfMoveClock: number;
      fullMoveNumber: number;
      comment?: string;
    } = {
      board: this.board.toArray(),
      activeColor: Colors[this.activeColor],
      castlingRights: this.castlingRights.toJSON(),
      enPassantIndex: this.enPassantIndex,
      halfMoveClock: this.halfMoveClock,
      fullMoveNumber: this.fullMoveNumber
    };

    if (this.comment)
      data.comment = this.comment;

    return data;
  }

  *castlingMoves() {
    if (this.isCheck())
      return;

    const enemyAttacks = this.board.getColorAttacks(this.inactiveColor);

    for (const [wing, rights] of this.castlingRights.entries()) {
      if (!rights[this.activeColor]) continue;
      const move = new CastlingMove({ color: this.activeColor, wing });
      if (move.isLegal(this.board, enemyAttacks))
        yield move;
    }
  }

  *generateLegalMoves(): Generator<Move> {
    for (const [srcIndex, piece] of this.board.getPieces()) {
      if (piece.color !== this.activeColor)
        continue;

      for (const destIndex of piece.getPseudoLegalDestIndices({ board: this.board, srcIndex, enPassantIndex: this.enPassantIndex })) {
        let move: Move;

        if (piece.isPawn()) {
          const isEnPassant = destIndex === this.enPassantIndex;
          move = new PawnMove({
            srcIndex,
            destIndex,
            srcPiece: piece,
            destPiece: isEnPassant ? piece.opposite : this.board.get(destIndex),
            isEnPassant
          });
        } else {
          move = new PieceMove({
            srcIndex,
            destIndex,
            srcPiece: piece,
            destPiece: this.board.get(destIndex)
          });
        }

        move.play(this.board);
        const isLegal = !this.board.isKingEnPrise(this.activeColor);
        move.undo(this.board);

        if (isLegal) {
          if (move instanceof PawnMove && move.isPromotion())
            for (const promotion of move.promotions())
              yield promotion;
          else
            yield move;
        }
      }
    }

    yield* this.castlingMoves();
  }
}

// ===== ===== ===== ===== =====
// LOCAL TYPES
// ===== ===== ===== ===== =====
