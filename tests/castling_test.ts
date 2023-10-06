import CastlingMove from "@/moves/CastlingMove.ts";
import { assert, assertArrayIncludes, assertEquals, assertFalse } from "@dev_deps";
import { CastlingRights, ChessGame, Color, Position, coords } from "../mod.ts";

Deno.test("castling rights from string", () => {
  const castlingRights = CastlingRights.fromString("kqKQ");
  assertEquals(castlingRights.toString(), "kqKQ");
});

Deno.test("castling rights from string - dash", () => {
  const castlingRights = CastlingRights.fromString("-");
  assertEquals(castlingRights.toString(), "-");
});

Deno.test("castling rights to string", () => {
  const castlingRights = new CastlingRights();
  castlingRights.get(Color.WHITE).add(0);
  castlingRights.get(Color.WHITE).add(7);
  castlingRights.get(Color.BLACK).add(7);
  assertEquals(castlingRights.toString(), "kKQ");
});

Deno.test("Rook should be on d1 after 0-0-0.", () => {
  const game = new ChessGame(`1.e4 c5 2.Nf3 Nc6 3.d4 cxd4 4.Nxd4 Qc7 5.Nc3 e6 6.Be3 a6 7.Qd2 b5 8.O-O-O *`);
  const rook = game.currentPosition.board.get(coords(3, 7));
  assert(rook?.isRook());
});

Deno.test("castling possible", () => {
  const position = Position.fromFEN("4k3/8/8/8/8/8/8/R3K2R w KQ - 0 1");
  const castlingMoves = position.legalMoves.filter((move) => move instanceof CastlingMove) as CastlingMove[];
  assert(castlingMoves.length === 2);
  assert(castlingMoves[0].isQueenSide());
  assert(!castlingMoves[1].isQueenSide());
});

Deno.test("castling queen side with b1 controlled", () => {
  const position = Position.fromFEN("1r2k3/8/8/8/8/8/8/R3K2R w KQ - 0 1");
  assertArrayIncludes(
    position.legalMovesAsAlgebraicNotation,
    ["0-0", "0-0-0"]
  );
});

Deno.test("castling queen side with c1 controlled", () => {
  const position = Position.fromFEN("2r1k3/8/8/8/8/8/8/R3K2R w KQ - 0 1");
  assertFalse(position.legalMovesAsAlgebraicNotation.includes("0-0-0"));
});