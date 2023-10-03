import type ChessGame from "@/game/ChessGame.ts";
import type Position from "@/game/Position.ts";

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
  const stack: Position[] = [];
  let prevPos: Position | undefined;

  for (const char of movesList) {
    switch (char) {
      case "(":
        playLine(buffer, game);
        stack.push(game.currentPosition);
        game.goBack();
        buffer = "";
        break;
      case ")":
        playLine(buffer, game);
        prevPos = stack.pop();
        if (!prevPos)
          throw new Error(`Invalid move list: "${movesList}".`);
        game.currentPosition = prevPos;
        buffer = "";
        break;
      case "{":
        playLine(buffer, game);
        buffer = "";
        break;
      case "}":
        game.currentPosition.comment = buffer.trim();
        buffer = "";
        break;
      default:
        buffer += char;
    }
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