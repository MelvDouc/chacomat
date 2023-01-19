import Chess960CastlingRights from "@chacomat/chess960/Chess960CastlingRights.js";
import Position from "@chacomat/game/Position.js";
import Board from "@chacomat/game/Board.js";
import Piece from "@chacomat/pieces/Piece.js";
import Color from "@chacomat/utils/Color.js";
import { getChess960PiecePlacement } from "@chacomat/utils/fischer-random.js";
import type {
  Chess960Game,
  Coords,
  CoordsGenerator,
  PositionParameters
} from "@chacomat/types.js";

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

  override isCastling(king: Piece, destCoords: Coords): boolean {
    return !!this.board.get(destCoords)?.isRook()
      && this.board.get(destCoords)!.color === king.color;
  }

  override *castlingCoords(): CoordsGenerator {
    yield* Piece.castlingCoords(this.board.kings[this.colorToMove], true);
  }
}