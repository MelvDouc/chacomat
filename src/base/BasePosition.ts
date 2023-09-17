import BaseBoard from "@/base/BaseBoard.ts";
import type Coords from "@/base/Coords.ts";
import type Move from "@/base/moves/Move.ts";
import PieceMove from "@/base/moves/PieceMove.ts";
import Color from "@/constants/Color.ts";
import { isCheckSymbol, legalMovesSymbol } from "@/constants/symbols.ts";

export default abstract class BasePosition<TBoard extends BaseBoard> {
  public abstract readonly board: TBoard;
  public abstract readonly activeColor: Color;
  public abstract readonly fullMoveNumber: number;
  public comment?: string;
  protected [isCheckSymbol]!: boolean;
  protected [legalMovesSymbol]!: Move[];

  public get legalMoves() {
    return this[legalMovesSymbol] ??= this.computeLegalMoves();
  }

  public get legalMovesAsAlgebraicNotation() {
    return this.legalMoves.map((move) => move.getAlgebraicNotation(this.board, this.legalMoves));
  }

  protected abstract pseudoLegalPawnMoves(srcCoords: Coords): Generator<Move>;

  protected *pseudoLegalMoves() {
    for (const [srcCoords, srcPiece] of this.board.getPiecesOfColor(this.activeColor)) {
      if (srcPiece.isPawn()) {
        yield* this.pseudoLegalPawnMoves(srcCoords);
        continue;
      }

      for (const destCoords of this.board.attackedCoords(srcCoords))
        if (this.board.get(destCoords)?.color !== this.activeColor)
          yield new PieceMove(srcCoords, destCoords);
    }
  }

  protected computeLegalMoves() {
    const legalMoves: Move[] = [];

    for (const move of this.pseudoLegalMoves()) {
      const undo = move.try(this.board);
      if (!this.board.isColorInCheck(this.activeColor))
        legalMoves.push(move);
      undo();
    }

    return legalMoves;
  }


  public isCheck() {
    return this[isCheckSymbol] ??= this.board.isColorInCheck(this.activeColor);
  }

  public toObject() {
    const obj: {
      board: ({ initial: string; color: string; } | null)[][];
      activeColor: string;
      fullMoveNumber: number;
      comment?: string;
    } = {
      board: this.board.toArray(),
      activeColor: this.activeColor.abbreviation,
      fullMoveNumber: this.fullMoveNumber,
    };
    if (this.comment) obj.comment = this.comment;
    return obj;
  }
}