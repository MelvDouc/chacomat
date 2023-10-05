import type { ChessGame, Position } from "@/typings/types.ts";
import { findClosingCurlyIndex, findClosingParenIndex } from "@/utils/string-search.ts";

const playLine = (() => {
  const moveRegexp = /([NBRQK]?[a-h]?[1-8]?x?[a-h][1-8](=[QRBN])?|(?<o>0|O)(-\k<o>){1,2})/g;

  return (line: string, game: ChessGame) => {
    for (const { 0: substring, index } of line.matchAll(moveRegexp)) {
      const move = findMove(substring, game.currentPosition);

      if (move) {
        game.playMove(move);
        continue;
      }

      throwMoveError({ substring, index: index!, line });
    }
  };
})();

function findMove(input: string, { legalMoves, board }: Position) {
  if (input.includes("-"))
    input = input.replace(/O/g, "0");

  return legalMoves.find((move) => input === move.algebraicNotation(board, legalMoves));
}

export default function playMoves(movesList: string, game: ChessGame) {
  let buffer = "";

  for (let i = 0; i < movesList.length;) {
    if (movesList[i] === "(") {
      playLine(buffer, game);
      buffer = "";
      const closingIndex = findClosingParenIndex(movesList, i);
      const { currentPosition } = game;
      game.goBack();
      playMoves(movesList.slice(i + 1, closingIndex), game);
      game.currentPosition = currentPosition;
      i = closingIndex + 1;
      continue;
    }

    if (movesList[i] === "{") {
      playLine(buffer, game);
      buffer = "";
      const closingIndex = findClosingCurlyIndex(movesList, i);
      game.currentPosition.comment = movesList.slice(i + 1, closingIndex);
      i = closingIndex + 1;
      continue;
    }

    buffer += movesList[i];
    i++;
  }

  playLine(buffer, game);
}

function throwMoveError({ substring, index, line }: {
  substring: string;
  index: number;
  line: string;
}) {
  const startIndex = (index - 20 < 0) ? 0 : index - 20;
  throw new Error(`Illegal move "${substring}" near "${line.slice(startIndex, index + 20)}".`);
}