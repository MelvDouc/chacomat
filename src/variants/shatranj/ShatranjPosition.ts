import Color from "@/base/Color.ts";
import type Move from "@/base/moves/Move.ts";
import PawnMove from "@/base/moves/PawnMove.ts";
import PieceMove from "@/base/moves/PieceMove.ts";
import { IMove, IPosition, JSONPosition } from "@/typings/types.ts";
import ShatranjBoard from "@/variants/shatranj/ShatranjBoard.ts";

export default class ShatranjPosition implements IPosition {
  // ===== ===== ===== ===== =====
  // STATIC PUBLIC
  // ===== ===== ===== ===== =====

  public static get START_FEN() {
    return "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w 1";
  }

  public static fromFen(fen: string) {
    const [boardStr, clr, fullMoveNumber] = fen.split(" ");

    return new this({
      board: this.createBoard().addPiecesFromString(boardStr),
      activeColor: Color.fromAbbreviation(clr),
      fullMoveNumber: Number(fullMoveNumber)
    });
  }

  public static new(fen?: string) {
    return this.fromFen(fen ?? this.START_FEN);
  }

  public static moveAsString(pos: ShatranjPosition, nextPos: ShatranjPosition, addMoveNumber: boolean) {
    const notation = nextPos.srcMove!.algebraicNotation(pos.board, pos.legalMoves)
      + (nextPos.isCheckmate() ? "#" : (nextPos.isCheck() ? "+" : ""));

    if (pos.activeColor === Color.WHITE) return `${pos.fullMoveNumber}.${notation}`;
    if (addMoveNumber) return `${pos.fullMoveNumber}...${notation}`;
    return notation;
  }

  // ===== ===== ===== ===== =====
  // STATIC PROTECTED
  // ===== ===== ===== ===== =====

  protected static readonly promotionInitials = new Map<Color, string[]>([
    [Color.WHITE, ["Q"]],
    [Color.BLACK, ["q"]]
  ]);

  protected static createBoard() {
    return new ShatranjBoard();
  }

  // ===== ===== ===== ===== =====
  // PUBLIC
  // ===== ===== ===== ===== =====

  public readonly board: ShatranjBoard;
  public readonly activeColor: Color;
  public readonly fullMoveNumber: number;
  public srcMove?: Move;
  public prev?: typeof this;
  public readonly next: (typeof this)[] = [];
  public comment?: string;
  #isCheck!: boolean;
  #legalMoves!: IMove[];

  public constructor({ board, activeColor, fullMoveNumber }: {
    board: ShatranjBoard;
    activeColor: Color;
    fullMoveNumber: number;
  }) {
    this.board = board;
    this.activeColor = activeColor;
    this.fullMoveNumber = fullMoveNumber;
  }

  public get legalMoves() {
    return this.#legalMoves ??= this.computeLegalMoves();
  }

  public get legalMovesAsAlgebraicNotation() {
    return this.legalMoves.map((move) => move.algebraicNotation(this.board, this.legalMoves));
  }

  public isCheck() {
    return this.#isCheck ??= this.board.isColorInCheck(this.activeColor);
  }

  public isCheckmate() {
    return this.isCheck() && !this.legalMoves.length
      || this.board.nonKingPieces().get(this.activeColor)?.length === 0;
  }

  public isStalemate() {
    return !this.isCheck() && !this.legalMoves.length;
  }

  public isMainLine(): boolean {
    return !this.prev
      || this.prev.isMainLine() && this.prev.next.indexOf(this) === 0;
  }

  public toString() {
    return `${this.board} ${this.activeColor.abbreviation} ${this.fullMoveNumber}`;
  }

  public toMoveList(varIndex = 0, addMoveNumber = false): string {
    if (!this.next.length)
      return "";

    let moveList = ShatranjPosition.moveAsString(this, this.next[varIndex], addMoveNumber);

    if (varIndex === 0)
      for (let i = 1; i < this.next.length; i++)
        moveList += ` ( ${this.toMoveList(i, true)} )`;

    const next = this.next[varIndex].toMoveList(0, this.next.length > 1);
    if (next) moveList += ` ${next}`;
    return moveList;
  }

  public toJSON() {
    const obj: JSONPosition = {
      board: this.board.toArray(),
      activeColor: this.activeColor.abbreviation,
      fullMoveNumber: this.fullMoveNumber,
    };
    if (this.comment) obj.comment = this.comment;
    return obj;
  }

  // ===== ===== ===== ===== =====
  // PROTECTED
  // ===== ===== ===== ===== =====

  protected *forwardPawnMoves(srcIndex: number) {
    const destIndex = srcIndex + this.board.height * this.activeColor.direction;

    if (!this.board.has(destIndex))
      yield new PawnMove(srcIndex, destIndex);
  }

  protected *pawnCaptures(srcIndex: number) {
    for (const destIndex of this.board.attackedIndices(srcIndex))
      if (this.board.get(destIndex)?.color === this.activeColor.opposite)
        yield new PawnMove(srcIndex, destIndex);
  }

  protected *pseudoLegalMoves() {
    for (const [srcIndex, srcPiece] of this.board.piecesOfColor(this.activeColor)) {
      if (srcPiece.isPawn()) {
        yield* this.forwardPawnMoves(srcIndex);
        yield* this.pawnCaptures(srcIndex);
        continue;
      }

      for (const destIndex of this.board.attackedIndices(srcIndex))
        if (this.board.get(destIndex)?.color !== this.activeColor)
          yield new PieceMove(srcIndex, destIndex);
    }
  }

  protected computeLegalMoves() {
    const legalMoves: IMove[] = [];

    for (const move of this.pseudoLegalMoves()) {
      const isPromotion = move instanceof PawnMove && move.isPromotion(this.board);
      const undo = move.try(this.board);

      if (!this.board.isColorInCheck(this.activeColor)) {
        if (isPromotion)
          (this.constructor as typeof ShatranjPosition).promotionInitials.get(this.activeColor)!.forEach((initial) => {
            legalMoves.push(new PawnMove(move.srcIndex, move.destIndex, this.board.pieceFromInitial(initial)));
          });
        else
          legalMoves.push(move);
      }

      undo();
    }

    return legalMoves;
  }
}