import type Move from "@/base/moves/Move.ts";
import Color from "@/constants/Color.ts";
import Board from "@/standard/Board.ts";
import Position from "@/standard/Position.ts";
import Chess960CastlingRightsMap from "@/variants/chess960/Chess960CastlingRightsMap.ts";
import Chess960CastlingMove from "@/variants/chess960/moves/Chess960CastlingMove.ts";

export default class Chess960Position extends Position {
  protected static readonly CastlingRightsMap: typeof Chess960CastlingRightsMap = Chess960CastlingRightsMap;

  public static get START_FEN(): string {
    throw new Error("`Chess960Position` has no unique initial FEN.");
  }

  public static new(fen?: string) {
    if (fen) return this.fromFen(fen);

    const board = new Board();
    const indices = new Set(Array.from({ length: board.width }, (_, i) => i));
    const { Pieces } = board.PieceConstructor;
    const castlingRights = new this.CastlingRightsMap([
      [Color.WHITE, new Set()],
      [Color.BLACK, new Set()]
    ]);

    const kingIndex = randomInt(1, 6);
    const queenRookIndex = randomInt(0, kingIndex - 1);
    const kingRookIndex = randomInt(kingIndex + 1, 7);
    indices.delete(kingIndex);
    indices.delete(queenRookIndex);
    indices.delete(kingRookIndex);

    const lsbIndex = [...indices][randomInt(0, indices.size - 1)];
    indices.delete(lsbIndex);

    const oppositeParityIndices = [...indices].filter((i) => i % 2 !== lsbIndex % 2);
    const dsbIndex = oppositeParityIndices[randomInt(0, oppositeParityIndices.length - 1)];
    indices.delete(dsbIndex);

    const remainingIndices = [...indices].sort(() => Math.random() - .5);
    board
      .set(kingIndex, Pieces.BLACK_KING)
      .set(queenRookIndex, Pieces.BLACK_ROOK)
      .set(kingRookIndex, Pieces.BLACK_ROOK)
      .set(lsbIndex, Pieces.BLACK_BISHOP)
      .set(dsbIndex, Pieces.BLACK_BISHOP)
      .set(remainingIndices[0], Pieces.BLACK_KNIGHT)
      .set(remainingIndices[1], Pieces.BLACK_KNIGHT)
      .set(remainingIndices[2], Pieces.BLACK_QUEEN);

    for (let i = 0; i < board.width; i++) {
      board.set(i + board.width * (board.height - 1), board.get(i)!.opposite);
      board.set(i + board.width, Pieces.BLACK_PAWN);
      board.set(i + board.width * (board.height - 2), Pieces.WHITE_PAWN);
    }

    castlingRights.get(Color.BLACK)!.add(queenRookIndex);
    castlingRights.get(Color.BLACK)!.add(kingRookIndex);
    castlingRights.get(Color.WHITE)!.add(queenRookIndex + board.width * (board.height - 1));
    castlingRights.get(Color.WHITE)!.add(kingRookIndex + board.width * (board.height - 1));

    return new this({
      activeColor: Color.WHITE,
      board,
      castlingRights,
      enPassantIndex: -1,
      halfMoveClock: 0,
      fullMoveNumber: 1
    });
  }

  declare public readonly castlingRights: Chess960CastlingRightsMap;
  declare public prev?: Chess960Position;
  public readonly next: Chess960Position[] = [];

  public constructor(params: {
    activeColor: Color;
    board: Board;
    castlingRights: Chess960CastlingRightsMap;
    enPassantIndex: number;
    fullMoveNumber: number;
    halfMoveClock: number;
  }) {
    super(params);
  }

  protected *castlingMoves() {
    const attackedIndices = this.board.getAttackedIndexSet(this.activeColor.opposite);
    const kingIndex = this.board.getKingIndex(this.activeColor);
    if (attackedIndices.has(kingIndex)) return;

    for (const rookSrcIndex of this.castlingRights.get(this.activeColor)!) {
      if (this.board.canCastle(rookSrcIndex, this.activeColor, attackedIndices))
        yield new Chess960CastlingMove(
          kingIndex,
          rookSrcIndex,
          rookSrcIndex
        );
    }
  }
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}