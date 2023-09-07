import Color from "@/constants/Color.ts";
import { Piece } from "@/constants/Pieces.ts";
import Position from "@/game/Position.ts";
import Chess960CastlingRights from "@/variants/chess960/game/Chess960CastlingRights.ts";
import Chess960CastlingMove from "@/variants/chess960/moves/Chess960CastlingMove.ts";

export default class Chess960Position extends Position {
  protected static override readonly CastlingRights = Chess960CastlingRights;

  public static override isValidFen(fen: string): boolean {
    return /^[pnbrqkPNBRQK1-8]+(\/[pnbrqkPNBRQK1-8]+){7} (w|b) ([A-Ha-h]{1,4}|-) ([a-h][36]|-) \d+ \d+$/.test(fen);
  }

  protected static getRandomWhitePieceRank() {
    const { Pieces } = Piece;
    let indices = Array.from({ length: this.Board.prototype.Coords.BOARD_WIDTH }, (_, y) => y);

    const kingY = randomInt(1, 6);
    const queenRookY = randomInt(0, kingY - 1);
    const kingRookY = randomInt(kingY + 1, 7);
    indices = indices.filter((y) => y !== kingY && y !== queenRookY && y !== kingRookY);

    const bishopY1 = indices[randomInt(0, indices.length - 1)];
    const oppositeParityIndices = indices.filter((y) => y % 2 !== bishopY1 % 2);
    const bishopY2 = oppositeParityIndices[randomInt(0, oppositeParityIndices.length - 1)];
    indices = indices
      .filter((y) => y !== bishopY1 && y !== bishopY2)
      .sort(() => Math.random() - 0.5);

    const pieces: Piece[] = [];
    pieces[kingY] = Pieces.WHITE_KING;
    pieces[queenRookY] = Pieces.WHITE_ROOK;
    pieces[kingRookY] = Pieces.WHITE_ROOK;
    pieces[bishopY1] = Pieces.WHITE_BISHOP;
    pieces[bishopY2] = Pieces.WHITE_BISHOP;
    pieces[indices[0]] = Pieces.WHITE_KNIGHT;
    pieces[indices[1]] = Pieces.WHITE_KNIGHT;
    pieces[indices[2]] = Pieces.WHITE_QUEEN;
    return pieces;
  }

  public static override new() {
    const { Coords, Piece: { Pieces } } = this.Board.prototype;
    const whitePieceRank = Color.WHITE.getPieceRank(Coords.BOARD_HEIGHT);
    const whitePawnRank = Color.WHITE.getPawnRank(Coords.BOARD_HEIGHT);
    const board = new this.Board();
    const castlingRights = new this.CastlingRights();

    this.getRandomWhitePieceRank().forEach((piece, y) => {
      board.set(Coords.get(0, y), piece.opposite);
      board.set(Coords.get(1, y), Pieces.BLACK_PAWN);
      board.set(Coords.get(whitePawnRank, y), Pieces.WHITE_PAWN);
      board.set(Coords.get(whitePieceRank, y), piece);
      if (piece.isRook()) {
        castlingRights.add(Color.WHITE, y);
        castlingRights.add(Color.BLACK, y);
      }
    });

    return new this(board, Color.WHITE, castlingRights, null, 0, 1);
  }

  protected override *castlingMoves() {
    const attackedCoordsSet = this.board.getAttackedCoordsSet(this.activeColor.opposite);
    const kingCoords = this.board.getKingCoords(this.activeColor);
    if (attackedCoordsSet.has(kingCoords)) return;

    for (const rookSrcY of this.castlingRights.files(this.activeColor)) {
      if (this.board.canCastle(rookSrcY, this.activeColor, attackedCoordsSet))
        yield new Chess960CastlingMove(
          kingCoords,
          this.board.Coords.get(kingCoords.x, rookSrcY),
          rookSrcY
        );
    }
  }
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}