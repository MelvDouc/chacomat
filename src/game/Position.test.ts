import ChessGame from "@chacomat/game/ChessGame.js";
import Position from "@chacomat/game/Position.js";
import { GameStatus, PieceType } from "@chacomat/utils/constants.js";

describe("FEN string", () => {
  it("should be produce itself", () => {
    const pos = Position.fromFenString(Position.startFenString);

    expect(pos.toString()).toBe(Position.startFenString);
  });

  it("should be valid after a move", () => {
    const game = new ChessGame({
      fen: "r5k1/p3rppp/1p2pn2/PP1bN3/8/2R1PP2/4B1PP/R5K1 b - - 0 24"
    });
    const pos1 = game.currentPosition;
    const pos2 = pos1.createPositionFromMove(17, 24, PieceType.QUEEN, true);

    expect(pos2.toString()).toBe("r5k1/p3rppp/4pn2/pP1bN3/8/2R1PP2/4B1PP/R5K1 w - - 0 25");
  });
});

describe("A triple repetition", () => {
  it("should occur on repeated moves", () => {
    const game = new ChessGame();
    const repeat = () => {
      game
        .moveWithNotations("g1", "f3")
        .moveWithNotations("b8", "c6")
        .moveWithNotations("f3", "g1")
        .moveWithNotations("c6", "b8");
    };

    repeat();
    repeat();
    repeat();

    expect(game.status).toBe(GameStatus.TRIPLE_REPETITION);
  });
});

describe("A board with only kings", () => {
  it("should be insufficient material", () => {
    const game = new ChessGame({ fen: "k7/8/8/8/8/8/8/7K w - - 0 1" });

    expect(game.status).toBe(GameStatus.INSUFFICIENT_MATERIAL);
  });
});