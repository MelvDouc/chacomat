import Chess960Position from "@chacomat/chess960/Chess960Position.js";
import Chess960CastlingRights from "@chacomat/chess960/Chess960CastlingRights.js";
import ChessGame from "@chacomat/game/ChessGame.js";
import Board from "@chacomat/game/Board.js";
import Piece from "@chacomat/pieces/Piece.js";
import Color from "@chacomat/utils/Color.js";
import { getChess960PiecePlacement } from "@chacomat/utils/fischer-random.js";
import { ChessGameParameters, PositionInfo } from "@chacomat/types.js";

export default class Chess960Game extends ChessGame {
  static override readonly #Position = Chess960Position;

  static #getRandomStartPositionInfo(): PositionInfo {
    const piecePlacement = getChess960PiecePlacement();
    const board = new Board();
    const castlingRights = new Chess960CastlingRights();
    let colorKey: keyof typeof Color,
      pieceKey: keyof typeof piecePlacement;

    for (colorKey in Color) {
      const color = Color[colorKey];
      castlingRights[color].push(...piecePlacement[Piece.TYPES.ROOK]);

      for (pieceKey in piecePlacement) {
        for (const y of piecePlacement[pieceKey]) {
          const coords = board.Coords.get(Piece.START_RANKS.PIECE[color], y);
          const piece = new Piece({
            color,
            board,
            coords,
            type: pieceKey
          });
          board.set(coords, piece);
          if (piece.isKing())
            board.kings[piece.color] = piece;
        }
      }

      for (let y = 0; y < 8; y++) {
        const coords = board.Coords.get(Piece.START_RANKS.PAWN[color], y);
        board.set(coords, new Piece({
          color,
          board,
          coords,
          type: Piece.TYPES.PAWN
        }));
      }
    }

    return {
      board,
      castlingRights,
      colorToMove: Color.WHITE,
      enPassantFile: -1,
      halfMoveClock: 0,
      fullMoveNumber: 1
    };
  }

  constructor(chessGameParameters: ChessGameParameters = {}) {
    if (!chessGameParameters.fenString && !chessGameParameters.positionInfo) {
      const positionInfo = Chess960Game.#getRandomStartPositionInfo();
      chessGameParameters.positionInfo = positionInfo;
    }
    super(chessGameParameters);
  }
}