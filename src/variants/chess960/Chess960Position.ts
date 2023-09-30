import Color from "@/base/Color.ts";
import { getRandomItem, randomInt, shuffle } from "@/utils/random.ts";
import Chess960Board from "@/variants/chess960/Chess960Board.ts";
import Chess960CastlingRights from "@/variants/chess960/Chess960CastlingRights.ts";
import Chess960CastlingMove from "@/variants/chess960/moves/Chess960CastlingMove.ts";
import Piece from "@/variants/standard/Piece.ts";
import Position from "@/variants/standard/Position.ts";

export default class Chess960Position extends Position {
  /** @throws {Error} */
  public static override get START_FEN(): string {
    throw new Error("`Chess960Position` has no unique initial FEN.");
  }

  protected static override createBoard() {
    return new Chess960Board();
  }

  protected static override castlingRightsFromString(str: string) {
    return Chess960CastlingRights.fromString(str);
  }

  protected static getRandomBlackPieceRank() {
    const files = Array.from({ length: 8 }, (_, i) => i);
    const { Pieces } = Piece;

    const kingY = randomInt(1, 6);
    const queenRookY = randomInt(0, kingY - 1);
    const kingRookY = randomInt(kingY + 1, 8 - 1);
    files.splice(kingY, 1);
    files.splice(files.indexOf(queenRookY), 1);
    files.splice(files.indexOf(kingRookY), 1);

    const bishopY1 = getRandomItem(files);
    files.splice(files.indexOf(bishopY1), 1);

    const bishopY2 = getRandomItem(files.filter((file) => file % 2 !== bishopY1 % 2));
    files.splice(files.indexOf(bishopY2), 1);
    const remainingFiles = shuffle(files);

    const rank: Piece[] = [];
    rank[kingY] = Pieces.BLACK_KING;
    rank[queenRookY] = Pieces.BLACK_ROOK;
    rank[kingRookY] = Pieces.BLACK_ROOK;
    rank[bishopY1] = Pieces.BLACK_BISHOP;
    rank[bishopY2] = Pieces.BLACK_BISHOP;
    rank[remainingFiles[0]] = Pieces.BLACK_KNIGHT;
    rank[remainingFiles[1]] = Pieces.BLACK_KNIGHT;
    rank[remainingFiles[2]] = Pieces.BLACK_QUEEN;
    return rank;
  }

  public static override new(fen?: string) {
    if (fen) return this.fromFen(fen);

    const board = this.createBoard();
    const castlingRights = this.castlingRightsFromString("-");

    this.getRandomBlackPieceRank().forEach((piece, index) => {
      board.set(index, piece);
      board.set(index + board.width, Piece.Pieces.BLACK_PAWN);
      board.set(index + board.width * (board.height - 2), Piece.Pieces.WHITE_PAWN);
      board.set(index + board.width * (board.height - 1), piece.opposite);

      if (piece.isRook()) {
        castlingRights.get(Color.WHITE).add(index);
        castlingRights.get(Color.BLACK).add(index);
      }
    });

    return new this({
      activeColor: Color.WHITE,
      board,
      castlingRights,
      enPassantIndex: -1,
      halfMoveClock: 0,
      fullMoveNumber: 1
    });
  }

  declare public readonly board: Chess960Board;
  declare public readonly castlingRights: Chess960CastlingRights;

  public constructor(params: {
    activeColor: Color;
    board: Chess960Board;
    castlingRights: Chess960CastlingRights;
    enPassantIndex: number;
    fullMoveNumber: number;
    halfMoveClock: number;
  }) {
    super(params);
  }

  // ===== ===== ===== ===== =====
  // PROTECTED
  // ===== ===== ===== ===== =====

  protected override getCastlingMove(kingIndex: number, rookSrcIndex: number) {
    return new Chess960CastlingMove(
      kingIndex,
      rookSrcIndex,
      rookSrcIndex
    );
  }
}