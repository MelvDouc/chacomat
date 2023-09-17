import type Coords from "@/base/Coords.ts";
import Color from "@/constants/Color.ts";
import Board from "@/standard/Board.ts";
import type Piece from "@/standard/Piece.ts";
import Position from "@/standard/Position.ts";
import Chess960Board from "@/variants/chess960/Chess960Board.ts";
import Chess960CastlingRights from "@/variants/chess960/Chess960CastlingRights.ts";
import Chess960CastlingMove from "@/variants/chess960/moves/Chess960CastlingMove.ts";

export default class Chess960Position extends Position {
  protected static get Board() {
    return Chess960Board;
  }

  protected static get CastlingRights() {
    return Chess960CastlingRights;
  }

  public static get START_FEN(): string {
    throw new Error("`Chess960Position` has no unique initial FEN.");
  }

  protected static getWhiteFirstRank() {
    const files = new Set(Array.from({ length: 8 }, (_, i) => i));
    const { Pieces } = this.Board.prototype.PieceConstructor;

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
    rank[remainingFiles[1]] = Pieces.WHITE_QUEEN;
    rank[remainingFiles[2]] = Pieces.WHITE_KNIGHT;
    return rank;
  }

  public static new(fen?: string) {
    if (fen) return this.fromFen(fen);

    const board = new this.Board();
    const castlingRights = new this.CastlingRights();

    this.getWhiteFirstRank().forEach((piece, y) => {
      board.set(board.Coords.get(0, y), piece.opposite);
      board.set(board.Coords.get(1, y), board.PieceConstructor.Pieces.BLACK_PAWN);
      board.set(board.Coords.get(board.height - 2, y), board.PieceConstructor.Pieces.WHITE_PAWN);
      board.set(board.Coords.get(board.height - 1, y), piece);
      if (piece.isRook())
        castlingRights.get(piece.color).add(y);
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
  declare public prev?: Chess960Position;
  public readonly next: Chess960Position[] = [];

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

  protected *castlingMoves() {
    const attackedCoords = this.board.getAttackedCoordsSet(this.activeColor.opposite);
    const kingCoords = this.board.getKingCoords(this.activeColor);
    if (attackedCoords.has(kingCoords)) return;

    for (const rookSrcY of this.castlingRights.get(this.activeColor)) {
      if (this.board.canCastle(rookSrcY, this.activeColor, attackedCoords)) {
        const rookSrcCoords = this.board.Coords.get(kingCoords.x, rookSrcY);
        yield new Chess960CastlingMove(
          kingCoords,
          rookSrcCoords,
          rookSrcCoords
        );
      }
    }
  }
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}