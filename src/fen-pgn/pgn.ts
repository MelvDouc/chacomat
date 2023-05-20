import Colors from "@src/constants/Colors.js";
import GameStatus from "@src/constants/GameStatus.js";
import { halfMoveToNotation, notationToHalfMove } from "@src/fen-pgn/half-move.js";
import { fenRegex, findClosingParenIndex, halfMoveRegex, infoRegex } from "@src/fen-pgn/utils.js";
import ChessGame from "@src/game/ChessGame.js";
import Position from "@src/game/Position.js";
import { GameMetaInfo } from "@src/types.js";

export { fenRegex, halfMoveToNotation };

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

export function enterPgn(pgn: string) {
  const { movesStr, gameMetaInfo } = getGameMetaInfoAndMovesStr(pgn);

  return {
    gameMetaInfo,
    enterMoves: (game: ChessGame) => parseVariations(game, movesStr)
  };
}

function enterNotations(game: ChessGame, movesStr: string) {
  for (const [notation] of movesStr.matchAll(halfMoveRegex)) {
    const move1 = notationToHalfMove(notation, game.currentPosition);

    if (!move1)
      throw new Error(`Illegal move: ${notation}`);

    game.playMove(...move1);
  }

  return game.currentPosition.prev as Position;
}

function parseVariations(game: ChessGame, movesStr: string) {
  let firstParenIndex: number;
  let pos = game.currentPosition;
  const stack: [Position, string][] = [];

  while ((firstParenIndex = movesStr.indexOf("(")) !== -1) {
    const closingParentIndex = findClosingParenIndex(movesStr, firstParenIndex);

    const firstHalf = movesStr.slice(0, firstParenIndex).trim();
    const varString = movesStr.slice(firstParenIndex + 1, closingParentIndex).trim();
    const secondHalf = movesStr.slice(closingParentIndex + 1).trim();

    if (firstHalf.length)
      pos = enterNotations(game, firstHalf);

    if (varString.length)
      stack.push([pos, varString]);

    movesStr = secondHalf;
  }

  if (movesStr.length)
    enterNotations(game, movesStr);

  stack.forEach(([pos, varString]) => {
    game.currentPosition = pos;
    parseVariations(game, varString);
  });
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