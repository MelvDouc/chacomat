import Chess960CastlingRights from "@chacomat/chess960/Chess960CastlingRights.js";
import Color from "@chacomat/constants/Color.js";
import Board from "@chacomat/game/Board.js";
import Position from "@chacomat/game/Position.js";
import Piece from "@chacomat/pieces/Piece.js";
import type {
  Chess960Game,
  IndexGenerator,
  PositionParameters
} from "@chacomat/types.js";
import { getChess960PiecePlacement } from "@chacomat/utils/fischer-random.js";

export default class Chess960Position extends Position {
  static override CastlingRights = Chess960CastlingRights;

  static getStartPositionInfo(): PositionParameters {
    const piecePlacement = getChess960PiecePlacement();
    const castlingRights = new Chess960CastlingRights();
    castlingRights[Color.WHITE].push(...piecePlacement[Piece.TYPES.ROOK]);
    castlingRights[Color.BLACK].push(...piecePlacement[Piece.TYPES.ROOK]);

    return {
      board: Board.getChess960InitialBoard(piecePlacement),
      castlingRights,
      enPassantFile: -1,
      colorToMove: Color.WHITE,
      halfMoveClock: 0,
      fullMoveNumber: 1
    };
  }

  override readonly castlingRights: Chess960CastlingRights;
  override game: Chess960Game;

  override isCastling(king: Piece, destIndex: number): boolean {
    return !!this.board.get(destIndex)?.isRook()
      && this.board.get(destIndex).color === king.color;
  }

  override *castlingCoords(): IndexGenerator {
    yield* Piece.castlingCoords(this.board.kings[this.colorToMove], true);
  }
}