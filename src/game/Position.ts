import Colors, { colorAbbreviations } from "$src/constants/Colors";
import SquareIndex, { indexTable, pointTable } from "$src/constants/SquareIndex";
import { BOARD_WIDTH } from "$src/constants/dimensions";
import Board from "$src/game/Board";
import CastlingRights from "$src/game/CastlingRights";
import CastlingMove from "$src/moves/CastlingMove";
import PawnMove from "$src/moves/PawnMove";
import PieceMove from "$src/moves/PieceMove";
import RealMove from "$src/moves/RealMove";
import Piece from "$src/pieces/Piece";
import { Color, Move } from "$src/typings/types";
import { isInsufficientMaterial } from "$src/utils/insufficient-material";

export default class Position {
  public static readonly START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w kqKQ - 0 1";

  public static fromFEN(fen: string) {
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

  public prev?: Position;
  public readonly next: Position[] = [];
  public srcMove?: Move;
  public comment?: string;
  private _legalMoves?: RealMove[];
  private _isCheck?: boolean;

  public constructor(
    public readonly board: Board,
    public readonly activeColor: Color,
    public readonly castlingRights: CastlingRights,
    public readonly enPassantIndex: SquareIndex | null,
    public readonly halfMoveClock: number,
    public readonly fullMoveNumber: number
  ) { }

  public get inactiveColor() {
    return -this.activeColor as Color;
  }

  public get legalMoves() {
    return this._legalMoves ??= [...this.generateLegalMoves()];
  }

  public get legalMovesAsAlgebraicNotation() {
    return this.legalMoves.map((move) => move.getAlgebraicNotation(this));
  }

  public getFullMoveNotation(use3Dots = false) {
    const { prev, srcMove } = this;

    if (!prev || !srcMove)
      return "";

    let notation = srcMove.getAlgebraicNotation(prev);

    if (srcMove instanceof RealMove)
      notation += srcMove.getCheckSign(this);

    if (prev.activeColor === Colors.WHITE)
      notation = `${prev.fullMoveNumber}.${notation}`;

    else if (use3Dots)
      notation = `${prev.fullMoveNumber}...${notation}`;

    if (this.comment)
      notation = `{ ${this.comment} } ${notation}`;

    if (srcMove.NAG)
      notation += ` ${srcMove.NAG}`;

    if (srcMove.comment)
      notation += ` { ${srcMove.comment} }`;

    return notation;
  }

  public isCheck() {
    return this._isCheck ??= this.board.isKingEnPrise(this.activeColor);
  }

  public isCheckmate() {
    return this.isCheck() && this.legalMoves.length === 0;
  }

  public isStalemate() {
    return !this.isCheck() && this.legalMoves.length === 0;
  }

  public isTripleRepetition() {
    let prevPos = this.prev;
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

  public isInsufficientMaterial() {
    return isInsufficientMaterial(this);
  }

  public isMainLine(): boolean {
    return !this.prev
      || this.prev.next.indexOf(this) === 0
      && this.prev.isMainLine();
  }

  /**
   * Clone this position with colors reversed and its board mirrored vertically.
   */
  public reverse() {
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

  public toFEN() {
    return [
      this.board.toString(),
      colorAbbreviations[this.activeColor],
      this.castlingRights.toString(),
      this.enPassantIndex !== null ? SquareIndex[this.enPassantIndex] : "-",
      this.halfMoveClock,
      this.fullMoveNumber
    ].join(" ");
  }

  public toMoveString(use3Dots = true): string {
    const [main, ...vars] = this.next;

    if (!main) return "";

    let notation = main.getFullMoveNotation(use3Dots);
    vars.forEach((variation) => {
      let rest = variation.toMoveString(false);
      if (rest) rest = ` ${rest}`;
      notation += ` ( ${variation.getFullMoveNotation(true) + rest} )`;
    });

    let rest = main.toMoveString(vars.length > 0);
    if (rest) rest = ` ${rest}`;
    return notation + rest;
  }

  public toJSON() {
    return {
      board: this.board.toArray(),
      activeColor: Colors[this.activeColor],
      castlingRights: this.castlingRights.toJSON(),
      enPassantIndex: this.enPassantIndex,
      halfMoveClock: this.halfMoveClock,
      fullMoveNumber: this.fullMoveNumber
    };
  }

  public *castlingMoves() {
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

  public *generateLegalMoves(): Generator<RealMove> {
    const { board, enPassantIndex } = this;

    for (const [srcIndex, piece] of board.getPieces()) {
      if (piece.color !== this.activeColor)
        continue;

      for (const destIndex of piece.getPseudoLegalDestIndices({ board, srcIndex, enPassantIndex })) {
        const move = piece.isPawn()
          ? this._createPawnMove(srcIndex, destIndex, piece, destIndex === enPassantIndex)
          : this._createPieceMove(srcIndex, destIndex, piece);
        move.play(board);
        const isLegal = !board.isKingEnPrise(this.activeColor);
        move.undo(board);

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

  private _createPieceMove(srcIndex: SquareIndex, destIndex: SquareIndex, piece: Piece) {
    return new PieceMove({
      srcIndex,
      destIndex,
      srcPiece: piece,
      destPiece: this.board.get(destIndex)
    });
  }

  private _createPawnMove(srcIndex: SquareIndex, destIndex: SquareIndex, piece: Piece, isEnPassant: boolean) {
    return new PawnMove({
      srcIndex,
      destIndex,
      srcPiece: piece,
      destPiece: isEnPassant ? piece.opposite : this.board.get(destIndex),
      isEnPassant
    });
  }
}