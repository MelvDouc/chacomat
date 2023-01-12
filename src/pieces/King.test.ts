import Color from "../constants/Color.js";
import Wing from "../constants/Wing.js";
import Coords from "../game/Coords.js";
import Position from "../game/Position.js";
import King from "./King.js";
import Piece from "./Piece.js";

const c1 = Coords.fromNotation("c1")!;
const d1 = Coords.fromNotation("d1")!;
const g1 = Coords.fromNotation("g1")!;

describe("A king", () => {
  it("should be able to castle with no squares between it and a rook", () => {
    const pos = Position.fromFenString("4k3/8/8/8/8/8/8/R3KBNR w KQ - 0 1");
    const { legalMovesAsNotation } = pos;

    expect(legalMovesAsNotation).toContain("e1-c1");
    expect(legalMovesAsNotation).not.toContain("e1-g1");
  });

  it("should not be able to castle through check", () => {
    const pos = Position.fromFenString("2r1k3/8/8/8/8/8/8/R3KBNR w KQ - 0 1");
    const whiteKingCoords = pos.board.kingCoords[Color.WHITE],
      whiteKing = pos.board.get(whiteKingCoords) as King;
    const castlingCoords = [
      ...whiteKing.castlingCoords(whiteKingCoords, pos.attackedCoordsSet, pos)
    ];

    expect(castlingCoords).not.toContain(c1);
  });
});

describe("Chess960", () => {
  it("should implement castling", () => {
    const pos = Position.fromFenString("nbbqrkrn/8/8/8/8/8/8/NB2RKR1 w KQkq - 0 1");
    Piece.startRookFiles[Wing.QUEEN_SIDE] = 4;
    Piece.startRookFiles[Wing.KING_SIDE] = 6;
    const whiteKingCoords = pos.board.kingCoords[Color.WHITE],
      whiteKing = pos.board.get(whiteKingCoords) as King;
    const castlingCoords = [
      ...whiteKing.castlingCoords(whiteKingCoords, pos.attackedCoordsSet, pos)
    ];

    expect(castlingCoords).toContain(c1);
    expect(castlingCoords).toContain(g1);
    Piece.startRookFiles[Wing.QUEEN_SIDE] = 0;
    Piece.startRookFiles[Wing.KING_SIDE] = 7;
  });
  it(" - king and rook should placed correctly after castling", () => {
    const posBefore = Position.fromFenString("nbbqrkrn/8/8/8/8/8/8/NB2RKR1 w KQkq - 0 1");
    const posAfter = posBefore.getPositionFromMove(Coords.get(7, 5)!, c1);

    expect(posAfter.board.get(c1)!.whiteInitial).toBe(King.whiteInitial);
    expect(posAfter.board.get(d1)!.whiteInitial).toBe("R");
  });
});