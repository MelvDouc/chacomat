import Color from "@/base/Color.ts";
import type Move from "@/base/moves/Move.ts";
import PawnMove from "@/base/moves/PawnMove.ts";
import PieceMove from "@/base/moves/PieceMove.ts";
import { ICoords, IMove, IPosition, JSONPosition } from "@/typings/types.ts";
import ShatranjBoard from "@/variants/shatranj/ShatranjBoard.ts";

export default class ShatranjPosition implements IPosition {
  public static get START_FEN() {
    return "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w 1";
  }

  public static fromFen(fen: string) {
    const [pieceStr, clr, fullMoveNumber] = fen.split(" ");

    return new this({
      board: new ShatranjBoard().addPiecesFromString(pieceStr),
      activeColor: Color.fromAbbreviation(clr),
      fullMoveNumber: Number(fullMoveNumber)
    });
  }

  public static new(fen?: string) {
    return this.fromFen(fen ?? this.START_FEN);
  }

  private static moveAsString(pos: ShatranjPosition, nextPos: ShatranjPosition, addMoveNumber: boolean) {
    const notation = nextPos.srcMove!.algebraicNotation(pos.board, pos.legalMoves)
      + (nextPos.isCheckmate() ? "#" : (nextPos.isCheck() ? "+" : ""));

    if (pos.activeColor === Color.WHITE) return `${pos.fullMoveNumber}.${notation}`;
    if (addMoveNumber) return `${pos.fullMoveNumber}...${notation}`;
    return notation;
  }

  public readonly board: ShatranjBoard;
  public readonly activeColor: Color;
  public readonly fullMoveNumber: number;
  public srcMove?: Move;
  public prev?: typeof this;
  public readonly next: (typeof this)[] = [];
  public comment?: string;
  protected _isCheck!: boolean;
  protected _legalMoves!: IMove[];

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
    return this._legalMoves ??= this.computeLegalMoves();
  }

  public get legalMovesAsAlgebraicNotation() {
    return this.legalMoves.map((move) => move.algebraicNotation(this.board, this.legalMoves));
  }

  public isCheck() {
    return this._isCheck ??= this.board.isColorInCheck(this.activeColor);
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

  protected *forwardPawnMoves(srcCoords: ICoords) {
    const forwardCoords = srcCoords.peer(this.activeColor.direction, 0);

    if (forwardCoords && !this.board.has(forwardCoords))
      yield new PawnMove(srcCoords, forwardCoords);
  }

  protected *pawnCaptures(srcCoords: ICoords) {
    for (const destCoords of this.board.attackedCoords(srcCoords))
      if (this.board.get(destCoords)?.color === this.activeColor.opposite)
        yield new PawnMove(srcCoords, destCoords);
  }

  protected *pseudoLegalMoves() {
    for (const [srcCoords, srcPiece] of this.board.piecesOfColor(this.activeColor)) {
      if (srcPiece.isPawn()) {
        yield* this.forwardPawnMoves(srcCoords);
        yield* this.pawnCaptures(srcCoords);
        continue;
      }

      for (const destCoords of this.board.attackedCoords(srcCoords))
        if (this.board.get(destCoords)?.color !== this.activeColor)
          yield new PieceMove(srcCoords, destCoords);
    }
  }

  protected computeLegalMoves() {
    const legalMoves: IMove[] = [];

    for (const move of this.pseudoLegalMoves()) {
      const undo = move.try(this.board);
      if (!this.board.isColorInCheck(this.activeColor))
        legalMoves.push(move);
      undo();
    }

    return legalMoves;
  }
}