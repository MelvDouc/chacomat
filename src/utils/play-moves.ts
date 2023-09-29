import { IChessGame, IPosition } from "@/typings/types.ts";
import { findClosingCurlyBraceIndex, findClosingParenIndex } from "@/utils/string-search.ts";

const playLine = (() => {
  const halfMoveRegex = /([NBRQKa-h1-8]{0,4}x?[a-h][1-8]+|0(-0){1,2})/g;

  return (line: string, game: IChessGame) => {
    line = line.replace(/O(-O){1,2}/g, (substring) => substring.replace(/O/g, "0"));

    for (const { 0: substring, index } of line.matchAll(halfMoveRegex)) {
      const halfMove = findHalfMove(substring, game.currentPosition);

      if (!halfMove) {
        const errMessage = `Illegal move "${substring}" near "${line.slice(index)}" in "${line}".`;
        throw new Error(errMessage);
      }

      game.playMove(halfMove);
    }
  };
})();

function findHalfMove(input: string, { legalMoves, board }: IPosition) {
  return legalMoves.find((move) => move.algebraicNotation(board, legalMoves) === input);
}

export default function playMoves(movesStr: string, game: IChessGame) {
  for (let i = 0; i < movesStr.length;) {
    if (movesStr[i] === "{") {
      const closingIndex = findClosingCurlyBraceIndex(movesStr, i);
      game.currentPosition.comment = movesStr.slice(i + 1, closingIndex);
      i = closingIndex + 1;
      continue;
    }

    if (movesStr[i] === "(") {
      const closingIndex = findClosingParenIndex(movesStr, i);
      const { currentPosition } = game;
      game.goBack();
      playMoves(movesStr.slice(i + 1, closingIndex), game);
      game.currentPosition = currentPosition;
      i = closingIndex + 1;
      continue;
    }

    let j = i + 1;
    while (j < movesStr.length && movesStr[j] !== "(" && movesStr[j] !== "{")
      j++;

    playLine(movesStr.slice(i, j), game);
    i = j;
  }
}