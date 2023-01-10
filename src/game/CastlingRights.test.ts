import Color from "../constants/Color.js";
import Wing from "../constants/Wing.js";
import CastlingRights from "./CastlingRights.js";
import ChessGame from "./ChessGame.js";

test("should be able to convert a string to an object", () => {
  const castlingRights = CastlingRights.fromString("KQk");

  expect(castlingRights[Color.WHITE][Wing.KING_SIDE]).toBe(true);
  expect(castlingRights[Color.WHITE][Wing.QUEEN_SIDE]).toBe(true);
  expect(castlingRights[Color.BLACK][Wing.QUEEN_SIDE]).toBe(false);
  expect(castlingRights[Color.BLACK][Wing.KING_SIDE]).toBe(true);
});

test("should be able to convert an object to a string", () => {
  const castlingRights = new CastlingRights();
  castlingRights[Color.WHITE][Wing.KING_SIDE] = false;

  expect(castlingRights.toString()).toBe("Qkq");
});

test("after some moves", () => {
  const game = new ChessGame();
  game
    .moveWithNotations("e2", "e3")
    .moveWithNotations("e7", "e6")
    .moveWithNotations("e1", "e2");

  const whiteCR = game.currentPosition.castlingRights[Color.WHITE];
  expect(whiteCR[Wing.QUEEN_SIDE]).toBe(false);
  expect(whiteCR[Wing.KING_SIDE]).toBe(false);
});