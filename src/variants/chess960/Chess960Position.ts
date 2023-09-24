import Color from "@/base/Color.ts";
import type Coords from "@/base/Coords.ts";
import { ICoords } from "@/typings/types.ts";
import Chess960Board from "@/variants/chess960/Chess960Board.ts";
import Chess960CastlingRights from "@/variants/chess960/Chess960CastlingRights.ts";
import Chess960CastlingMove from "@/variants/chess960/moves/Chess960CastlingMove.ts";
import Board from "@/variants/standard/Board.ts";
import Piece from "@/variants/standard/Piece.ts";
import Position from "@/variants/standard/Position.ts";

export default class Chess960Position extends Position {
  protected static override get Board() {
    return Chess960Board;
  }

  protected static override get CastlingRights() {
    return Chess960CastlingRights;
  }

  public static override get START_FEN(): string {
    throw new Error("`Chess960Position` has no unique initial FEN.");
  }

  protected static getWhiteFirstRank() {
    const files = new Set(Array.from({ length: 8 }, (_, i) => i));
    const { Pieces } = Piece;

    const kingY = randomInt(1, 6);
    const queenRookY = randomInt(0, kingY - 1);
    const kingRookY = randomInt(kingY + 1, 7);
    files.delete(kingY);
    files.delete(queenRookY);
    files.delete(kingRookY);

    const bishopY1 = [...files][randomInt(0, files.size - 1)];
    files.delete(bishopY1);

    const oppositeParityFiles = [...files].filter((i) => i % 2 !== bishopY1 % 2);
    const bishopY2 = oppositeParityFiles[randomInt(0, oppositeParityFiles.length - 1)];
    files.delete(bishopY2);
    const remainingFiles = [...files].sort(() => Math.random() - .5);

    const rank: Piece[] = [];
    rank[kingY] = Pieces.WHITE_KING;
    rank[queenRookY] = Pieces.WHITE_ROOK;
    rank[kingRookY] = Pieces.WHITE_ROOK;
    rank[bishopY1] = Pieces.WHITE_BISHOP;
    rank[bishopY2] = Pieces.WHITE_BISHOP;
    rank[remainingFiles[0]] = Pieces.WHITE_KNIGHT;
    rank[remainingFiles[1]] = Pieces.WHITE_KNIGHT;
    rank[remainingFiles[2]] = Pieces.WHITE_QUEEN;
    return rank;
  }

  public static override new(fen?: string) {
    if (fen) return this.fromFen(fen);

    const board = new this.Board();
    const castlingRights = new this.CastlingRights();

    this.getWhiteFirstRank().forEach((piece, y) => {
      board.set(board.coords(board.height - 1, y), piece);
      board.set(board.coords(0, y), piece.opposite);
      board.set(board.coords(board.height - 2, y), Piece.Pieces.WHITE_PAWN);
      board.set(board.coords(1, y), Piece.Pieces.BLACK_PAWN);

      if (piece.isRook()) {
        castlingRights.get(Color.WHITE).add(y);
        castlingRights.get(Color.BLACK).add(y);
      }
    });

    return new this({
      activeColor: Color.WHITE,
      board,
      castlingRights,
      enPassantCoords: null,
      halfMoveClock: 0,
      fullMoveNumber: 1
    });
  }

  declare public readonly board: Chess960Board;
  declare public readonly castlingRights: Chess960CastlingRights;

  public constructor(params: {
    activeColor: Color;
    board: Board;
    castlingRights: Chess960CastlingRights;
    enPassantCoords: Coords | null;
    fullMoveNumber: number;
    halfMoveClock: number;
  }) {
    super(params);
  }

  // ===== ===== ===== ===== =====
  // PROTECTED
  // ===== ===== ===== ===== =====

  protected override getCastlingMove(kingCoords: ICoords, rookSrcY: number) {
    const rookSrcCoords = this.board.coords(kingCoords.x, rookSrcY);
    return new Chess960CastlingMove(
      kingCoords,
      rookSrcCoords,
      rookSrcCoords
    );
  }
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}