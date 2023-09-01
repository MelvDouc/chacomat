import type ChessGame from "@game/ChessGame.js";
import playMoves from "@pgn/play-moves.js";
import { Result } from "@types.js";

const infoRegex = /\[(?<key>\w+)\s+"(?<value>[^"]*)"\]/;

export default function parsePgn(pgn: string) {
  let matchArray: RegExpMatchArray | null;
  const metaData: Record<string, string> = {};

  while ((matchArray = pgn.match(infoRegex)) !== null && matchArray.groups) {
    metaData[matchArray.groups["key"]] = matchArray.groups["value"];
    pgn = pgn.slice(matchArray[0].length).trimStart();
  }

  return {
    metaData,
    enterMoves: (game: ChessGame) => playMoves(pgn, game),
    result: (pgn.match(/((0|1)-(0|1)|1\/2-1\/2|\*)$/)?.at(0) ?? "*") as Result
  };
}