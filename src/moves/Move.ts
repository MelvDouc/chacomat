import Board from "@/board/Board.ts";
import { Coords, JSONMove } from "@/typings/types.ts";

export default abstract class Move {
  constructor(
    public readonly srcCoords: Coords,
    public readonly destCoords: Coords,
  ) { }

  abstract try(board: Board): () => void;
  abstract algebraicNotation(board: Board, legalMoves: Move[]): string;

  computerNotation() {
    return this.srcCoords.notation + this.destCoords.notation;
  }

  toJSON(board: Board, legalMoves: Move[]): JSONMove {
    return {
      srcCoords: this.srcCoords.toJSON(),
      destCoords: this.destCoords.toJSON(),
      algebraicNotation: this.algebraicNotation(board, legalMoves)
    };
  }
}