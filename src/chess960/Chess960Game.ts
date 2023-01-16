import Chess960Position from "@chacomat/chess960/Chess960Position.js";
import Chess960CastlingRights from "@chacomat/chess960/Chess960CastlingRights.js";
import ChessGame from "@chacomat/game/ChessGame.js";
import Board from "@chacomat/game/Board.js";
import Piece from "@chacomat/pieces/index.js";
import { getChess960PiecePlacement } from "@chacomat/utils/fischer-random.js";
import type {
  PieceInfo
} from "@chacomat/types.js";

export default class Chess960Game extends ChessGame {
  protected static override readonly Position = Chess960Position;

  public static getRandomStartPosition(): Chess960Game {
    const piecePlacement = getChess960PiecePlacement();
    const board = new Board();
    const castlingRights = new Chess960CastlingRights();
    let colorKey: keyof typeof this.Colors,
      pieceKey: keyof typeof piecePlacement;

    for (colorKey in this.Colors) {
      const color = this.Colors[colorKey];
      castlingRights[color].push(...piecePlacement[Piece.WHITE_PIECE_INITIALS.ROOK]);

      for (pieceKey in piecePlacement) {
        for (const y of piecePlacement[pieceKey]) {
          const coords = board.Coords.get(Piece.START_PIECE_RANKS[color], y);
          const piece = Reflect.construct(Piece.constructors.get(pieceKey)!, [{
            color,
            coords,
            board
          } as PieceInfo]) as Piece;
          board.set(coords, piece);
          if (piece.isKing())
            board.kings[piece.color] = piece;
        }
      }

      for (let y = 0; y < 8; y++) {
        const coords = board.Coords.get(Piece.START_PAWN_RANKS[color], y);
        board.set(coords, Reflect.construct(Piece.constructors.get(Piece.WHITE_PIECE_INITIALS.PAWN)!, [{
          color,
          coords,
          board
        } as PieceInfo]));
      }
    }

    return new Chess960Game({
      positionInfo: {
        board,
        castlingRights,
        colorToMove: this.Colors.WHITE,
        enPassantFile: -1,
        halfMoveClock: 0,
        fullMoveNumber: 1
      }
    });
  }
}