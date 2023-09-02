import Color from "@constants/Color.js";
import Coords from "@constants/Coords.js";
import Piece from "@constants/Piece.js";
import Wing from "@constants/Wing.js";
import Board from "@game/Board.js";
import Position from "@game/Position.js";
import CastlingMove from "@moves/CastlingMove.js";
import Chess960CastlingRights from "@variants/chess960/Chess960CastlingRights.js";

export default class Chess960Position extends Position {
  protected static override readonly CastlingRights = Chess960CastlingRights;

  public static override isValidFen(fen: string): boolean {
    return /^[pnbrqkPNBRQK1-8]+(\/[pnbrqkPNBRQK1-8]+){7} (w|b) ([A-Ha-h]{1,4}|-) ([a-h][36]|-) \d+ \d+$/.test(fen);
  }

  protected static getRandomWhitePieceRank() {
    let indices = Array.from({ length: 8 }, (_, y) => y);

    const kingY = randomInt(1, 6);
    const queenRookY = randomInt(0, kingY - 1);
    const kingRookY = randomInt(kingY + 1, 7);
    indices = indices.filter((y) => y !== kingY && y !== queenRookY && y !== kingRookY);

    const bishopY1 = indices[randomInt(0, indices.length - 1)];
    const bishopY2 = indices
      .filter((y) => y % 2 !== bishopY1 % 2)
      .find((_, i, arr) => randomInt(0, 1) || i === arr.length - 1)!;
    indices = indices.filter((y) => y !== bishopY1 && y !== bishopY2).sort(() => Math.random() - 0.5);

    const pieces: Piece[] = [];
    pieces[kingY] = Piece.WHITE_KING;
    pieces[queenRookY] = Piece.WHITE_ROOK;
    pieces[kingRookY] = Piece.WHITE_ROOK;
    pieces[bishopY1] = Piece.WHITE_BISHOP;
    pieces[bishopY2] = Piece.WHITE_BISHOP;
    pieces[indices[0]] = Piece.WHITE_KNIGHT;
    pieces[indices[1]] = Piece.WHITE_KNIGHT;
    pieces[indices[2]] = Piece.WHITE_QUEEN;
    return pieces;
  }

  public static random() {
    const board = new Board();
    const castlingRights = new this.CastlingRights();

    this.getRandomWhitePieceRank().forEach((piece, y) => {
      board.set(Coords.get(0, y), piece.opposite);
      board.set(Coords.get(1, y), Piece.BLACK_PAWN);
      board.set(Coords.get(6, y), Piece.WHITE_PAWN);
      board.set(Coords.get(7, y), piece);
      if (piece.isRook()) {
        castlingRights.addFile(Color.WHITE, y);
        castlingRights.addFile(Color.BLACK, y);
      }
    });

    return new this(board, Color.WHITE, castlingRights, null, 0, 1);
  }

  protected override getCastlingMove(kingCoords: Coords, wing: Wing, rookSrcY: number): CastlingMove {
    return new CastlingMove(kingCoords, Coords.get(kingCoords.x, rookSrcY), rookSrcY, wing);
  }
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}