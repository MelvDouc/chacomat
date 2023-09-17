import BasePosition from "@/base/BasePosition.ts";
import type Coords from "@/base/Coords.ts";
import type Move from "@/base/moves/Move.ts";
import PawnMove from "@/base/moves/PawnMove.ts";
import Color from "@/constants/Color.ts";
import { ShatranjPositionObject } from "@/types.ts";
import ShatranjBoard from "@/variants/shatranj/ShatranjBoard.ts";

export default class ShatranjPosition extends BasePosition<ShatranjBoard> {
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
    const notation = nextPos.srcMove!.getAlgebraicNotation(pos.board, pos.legalMoves)
      + (nextPos.isCheckmate() ? "#" : (nextPos.isCheck() ? "+" : ""));

    if (pos.activeColor === Color.WHITE) return `${pos.fullMoveNumber}.${notation}`;
    if (addMoveNumber) return `${pos.fullMoveNumber}...${notation}`;
    return notation;
  }

  public readonly board: ShatranjBoard;
  public readonly activeColor: Color;
  public readonly fullMoveNumber: number;
  public prev?: ShatranjPosition;
  public srcMove?: Move;
  public readonly next: ShatranjPosition[] = [];

  public constructor({ board, activeColor, fullMoveNumber }: {
    board: ShatranjBoard;
    activeColor: Color;
    fullMoveNumber: number;
  }) {
    super();
    this.board = board;
    this.activeColor = activeColor;
    this.fullMoveNumber = fullMoveNumber;
  }

  protected *pseudoLegalPawnMoves(srcCoords: Coords) {
    const forwardCoords = srcCoords.peer(this.activeColor.direction, 0);

    if (forwardCoords && !this.board.has(forwardCoords))
      yield new PawnMove(srcCoords, forwardCoords);

    for (const destCoords of this.board.attackedCoords(srcCoords))
      if (this.board.get(destCoords)?.color === this.activeColor.opposite)
        yield new PawnMove(srcCoords, destCoords);
  }

  public isCheckmate() {
    return this.isCheck() && !this.legalMoves.length
      || this.board.getNonKingPieces().get(this.activeColor)?.length === 0;
  }

  public isStalemate() {
    return !this.isCheck() && !this.legalMoves.length;
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

  public toObject(): ShatranjPositionObject {
    return {
      ...super.toObject(),
      FEN: this.toString(),
      prev: this.prev?.toObject() ?? null,
      next: this.next.map((position) => ({
        move: position.srcMove!.toObject(this.board, this.legalMoves),
        position: position.toObject()
      })),
      legalMoves: this.legalMoves.map((move) => move.toObject(this.board, this.legalMoves))
    };
  }
}