import Colors from "@src/constants/Colors.js";
import GameStatus from "@src/constants/GameStatus.js";
import ChessGame from "@src/game/ChessGame.js";
import Position from "@src/game/Position.js";
import { notationToHalfMove } from "@src/pgn-fen/half-move.js";
import parseVariations from "@src/pgn-fen/parse-variations.js";
import { GameMetaInfo } from "@src/types.js";

const infoRegex = /^\[(?<k>\w+)\s+"(?<v>[^"]*)"\]/;

// ===== ===== ===== ===== =====
// PARSE
// ===== ===== ===== ===== =====

function getGameMetaInfoAndMovesStr(pgn: string): {
  gameMetaInfo: Partial<GameMetaInfo>;
  movesStr: string;
} {
  const gameMetaInfo = {} as Partial<GameMetaInfo>;
  let matchArr: RegExpMatchArray | null;
  pgn = pgn.trimStart();

  while ((matchArr = pgn.match(infoRegex))?.groups) {
    gameMetaInfo[matchArr.groups["k"]] = matchArr.groups["v"];
    pgn = pgn.slice(matchArr[0].length).trimStart();
  }

  return {
    gameMetaInfo,
    movesStr: pgn
  };
}

// TODO: play variations
export function enterPgn(pgn: string) {
  const { movesStr, gameMetaInfo } = getGameMetaInfoAndMovesStr(pgn);

  return {
    gameMetaInfo,
    enterMoves: (game: ChessGame) => {
      const [mainLine] = parseVariations(movesStr);

      for (const { whiteMove, blackMove } of mainLine) {
        if (whiteMove) {
          const halfMove = notationToHalfMove(whiteMove, game.currentPosition);
          if (!halfMove)
            throw new Error(`Invalid move: "${whiteMove}".`);
          game.playMove(...halfMove);
        }

        if (blackMove) {
          const halfMove = notationToHalfMove(blackMove, game.currentPosition);
          if (!halfMove)
            throw new Error(`Invalid move: "${blackMove}".`);
          game.playMove(...halfMove);
        }
      }
    }
  };
}

// ===== ===== ===== ===== =====
// STRINGIFY
// ===== ===== ===== ===== =====

export function stringifyMetaInfo(metaInfo: ChessGame["metaInfo"]): string {
  return Object.entries(metaInfo)
    .map(([key, value]) => `[${key} "${value}"]`)
    .join("\n");
}

export function stringifyMoves(position: Position, varIndex = 0): string {
  const moves: string[] = [];
  const next = position.next[varIndex];

  if (next) {
    const moveNo = (position.activeColor === Colors.WHITE) ? `${position.fullMoveNumber}. `
      : (varIndex > 0) ? `${position.fullMoveNumber}... `
        : "";
    const checkAnnotation = (next.position.status === GameStatus.CHECKMATE) ? "#"
      : (next.position.isCheck()) ? "+"
        : "";
    moves.push(moveNo + next.notation + checkAnnotation);
  }

  if (varIndex === 0)
    for (let i = 1; i < position.next.length; i++)
      moves.push(`( ${stringifyMoves(position, i)} )`);

  if (next)
    moves.push(stringifyMoves(next.position, 0));

  return moves.join(" ").trimEnd();
}