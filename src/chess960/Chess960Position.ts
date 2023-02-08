import Chess960CastlingRights from "@chacomat/chess960/Chess960CastlingRights.js";
import { getChess960PiecePlacement } from "@chacomat/chess960/random-placements.js";
import Board from "@chacomat/game/Board.js";
import Position from "@chacomat/game/Position.js";
import Piece from "@chacomat/pieces/Piece.js";
import type {
  Chess960Game, PositionParameters
} from "@chacomat/types.local.js";

export default class Chess960Position extends Position {
  static override CastlingRights = Chess960CastlingRights;

  static getStartPositionInfo(): PositionParameters {
    const piecePlacement = getChess960PiecePlacement();
    const castlingRights = new Chess960CastlingRights();
    castlingRights.WHITE.push(...piecePlacement["R"]);
    castlingRights.BLACK.push(...piecePlacement["R"]);

    return {
      board: Board.getChess960InitialBoard(piecePlacement),
      castlingRights,
      enPassantIndex: -1,
      colorToMove: "WHITE",
      halfMoveClock: 0,
      fullMoveNumber: 1
    };
  }

  override readonly castlingRights: Chess960CastlingRights;
  override game: Chess960Game;

  override isCastling(king: Piece, destIndex: number): boolean {
    const possibleRook = this.board.get(destIndex);
    return possibleRook?.pieceName === "Rook" && possibleRook.color === king.color;
  }

  override *castlingIndices() {
    yield* this.board.kings[this.colorToMove].castlingIndices(true);
  }
}