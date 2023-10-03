import ChessGame from "@/game/ChessGame.ts";
import { assertEquals } from "@dev_deps";

const pgn1 = await Deno.readTextFile("pgn-files/online-game.pgn");

Deno.test("handle variations", () => {
  const game = new ChessGame({ pgn: pgn1 });
  const gameStr = game.toString();
  const openingParenCount = [...gameStr].filter(c => c === "(").length;
  assertEquals(openingParenCount, 7, gameStr);
});