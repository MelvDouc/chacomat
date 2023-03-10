import Chess960Board from "@chacomat/chess960/Chess960Board.js";
import Chess960CastlingRights from "@chacomat/chess960/Chess960CastlingRights.js";
import Position from "@chacomat/game/Position.js";
import Piece from "@chacomat/pieces/Piece.js";
import Coords from "@chacomat/utils/Coords.js";
import type { PositionParameters } from "@chacomat/types.local.js";

export default class Chess960Position extends Position {
  static override CastlingRights = Chess960CastlingRights;
  static override Board = Chess960Board;

  static getStartPositionInfo(): PositionParameters {
    const board = this.Board.create();
    const castlingRights = new Chess960CastlingRights();
    const firstRank = board.atX(0);
    for (let y = 0; y < 8; y++) {
      if (firstRank.atY(y)?.isRook()) {
        castlingRights.WHITE.push(y);
        castlingRights.BLACK.push(y);
      }
    }

    return {
      board,
      castlingRights,
      enPassantY: -1,
      colorToMove: "WHITE",
      halfMoveClock: 0,
      fullMoveNumber: 1
    };
  }

  override castle(king: Piece, destCoords: Coords, board: Chess960Board): void {
    const wing = destCoords.y < king.y ? 0 : 7;
    const rook = board.get(destCoords);
    board.transfer(king, Coords.get(king.x, Piece.CASTLED_KING_FILES[wing]));
    board.transfer(rook, Coords.get(king.x, Piece.CASTLED_ROOK_FILES[wing]));
  }

  override *castlingCoords() {
    yield* this.board.kings[this.colorToMove].castlingCoords(true, this.castlingRights, this.board, this.attackedCoords);
  }

  override isCastling(king: Piece, destCoords: Coords): boolean {
    const possibleRook = this.board.get(destCoords);
    return possibleRook?.isRook() && possibleRook.color === king.color;
  }
}