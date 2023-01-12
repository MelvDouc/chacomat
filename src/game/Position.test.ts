import ChessGame from "./ChessGame.js";
import Position from "./Position.js";

describe("FEN string", () => {
  it("should be produce itself", () => {
    const pos = Position.fromFenString(Position.startFenString);

    expect(pos.toString()).toBe(Position.startFenString);
  });

  it("should be valid after a move", () => {
    const pos1 = Position.fromFenString(
      `r5k1/p3rppp/1p2pn2/PP1bN3/8/2R1PP2/4B1PP/R5K1 b - - 0 24`,
    );
    const pos2 = pos1.getPositionFromMove(
      pos1.board.Coords.get(2, 1)!,
      pos1.board.Coords.get(3, 0)!,
      "Q",
      true,
    );

    expect(pos2.toString()).toBe(`r5k1/p3rppp/4pn2/pP1bN3/8/2R1PP2/4B1PP/R5K1 w - - 0 25`);
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

    expect(game.status).toBe(ChessGame.Statuses.TRIPLE_REPETITION);
  });
});

describe("A board with only kings", () => {
  it("should be insufficient material", () => {
    const game = new ChessGame({
      fenString: "k7/8/8/8/8/8/8/7K w - - 0 1"
    });

    expect(game.currentPosition.status).toBe(ChessGame.Statuses.INSUFFICIENT_MATERIAL);
  });
});