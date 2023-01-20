import { ChessGame, GameMetaInfo } from "@chacomat/types.js";
import getMetaInfo from "@chacomat/utils/pgn/meta-info.js";
import { playMovesFromPgn } from "./moves.js";

export default function enterPgn(pgn: string): {
  pgnInfo: GameMetaInfo;
  enterMoves: (game: ChessGame) => void;
} {
  const { pgnInfo, movesStr } = getMetaInfo(pgn);
  return {
    pgnInfo,
    enterMoves: (game) => playMovesFromPgn(movesStr, game)
  };
}