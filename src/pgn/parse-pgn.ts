import playMoves from "@/pgn/play-moves.ts";
import type ShatranjGame from "@/variants/shatranj/ShatranjGame.ts";

const infoRegex = /\[(?<key>\w+)\s+"(?<value>[^"]*)"\]/;

export default function parsePgn(pgn: string) {
  let matchArray: RegExpMatchArray | null;
  const metaData: Record<string, string> = {};

  while ((matchArray = pgn.match(infoRegex))?.groups) {
    metaData[matchArray.groups["key"] as keyof typeof metaData] = matchArray.groups["value"];
    pgn = pgn.slice(matchArray[0].length).trimStart();
  }

  const result = pgn.match(/((0|1)-(0|1)|1\/2-1\/2|\*)$/)?.at(0);
  if (result && metaData.Result && result !== metaData.Result)
    console.warn(`Inconsistent result: ${metaData.Result} in game info vs. ${result} in moves list.`);

  return {
    metaData,
    enterMoves: (game: ShatranjGame<any>) => playMoves(pgn, game)
  };
}