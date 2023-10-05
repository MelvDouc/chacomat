import ChessGame from "@/game/ChessGame.ts";
import { assertEquals } from "@dev_deps";

const pgn1 = await Deno.readTextFile("pgn-files/online-game.pgn");
const actualOpeningParenCount = [...pgn1].filter(c => c === "(").length;

Deno.test("handle variations", () => {
  const game = new ChessGame({ pgn: pgn1 });
  const gameStr = game.toPGN();
  const openingParenCount = [...gameStr].filter(c => c === "(").length;
  assertEquals(openingParenCount, actualOpeningParenCount, gameStr);
});