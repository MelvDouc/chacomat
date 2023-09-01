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

  protected static getShuffledPieces() {
    let indices = Array.from({ length: 8 }, (_, y) => y);

    const kingY = randomInt(0, 8 - 1);
    const queenRookY = randomInt(0, kingY - 1);
    const kingRookY = randomInt(kingY + 1, 8 - 1);
    indices = indices.filter((y) => y !== kingY && y !== queenRookY && y !== kingRookY);

    const bishopY1 = indices[randomInt(0, indices.length - 1)];
    const bishopY2 = indices
      .filter((y) => y % 2 !== bishopY1 % 2)
      .find((_, i, arr) => randomInt(0, 1) || i === arr.length - 1)!;
    indices = shuffle(indices.filter((y) => y !== bishopY1 && y !== bishopY2));

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

    for (let y = 0; y < 8; y++)
      board.set(Coords.get(1, y), Piece.BLACK_PAWN);
    for (let y = 0; y < 8; y++)
      board.set(Coords.get(6, y), Piece.WHITE_PAWN);

    this.getShuffledPieces().forEach((piece, y) => {
      board.set(Coords.get(0, y), piece);
      board.set(Coords.get(7, y), piece.opposite);
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

function shuffle<T>(arr: T[]) {
  return arr.sort(() => Math.random() - 0.5);
}