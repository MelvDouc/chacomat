import assert from "node:assert";
import test from "node:test";
import Colors from "../constants/Color.js";
import { notationToCoords } from "../constants/coords.js";
import Wings from "../constants/Wing.js";
import ChessGame from "./ChessGame.js";

test("Checkmate #1", () => {
  const game = new ChessGame();
  game
    .moveWithNotations("f2", "f3")
    .moveWithNotations("e7", "e6")
    .moveWithNotations("g2", "g4")
    .moveWithNotations("d8", "h4");

  assert.strictEqual(game.currentPosition.status, "checkmate");
});

test("En Passant #1", () => {
  const game = new ChessGame();
  game
    .moveWithNotations("e2", "e4")
    .moveWithNotations("d7", "d5")
    .moveWithNotations("e4", "d5")
    .moveWithNotations("e7", "e5");

  assert.strictEqual(
    game.currentPosition.enPassantFile,
    notationToCoords("e6")!.y,
  );
});

test("En Passant #2", () => {
  const game = new ChessGame();
  game
    .moveWithNotations("e2", "e4")
    .moveWithNotations("d7", "d5")
    .moveWithNotations("e4", "d5")
    .moveWithNotations("e7", "e5");

  assert(
    game.currentPosition.legalMovesAsNotation.includes(`d5-e6`),
    "ok",
  );
});

test("Castling Rights", () => {
  const game = new ChessGame();
  game
    .moveWithNotations("e2", "e3")
    .moveWithNotations("e7", "e6")
    .moveWithNotations("e1", "e2");

  assert.strictEqual(
    game.currentPosition.castlingRights[Colors.WHITE][Wings.QUEEN_SIDE],
    false,
  );
  assert.strictEqual(
    game.currentPosition.castlingRights[Colors.WHITE][Wings.KING_SIDE],
    false,
  );
});
