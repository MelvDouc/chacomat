import { IChessGame, IPosition } from "@/typings/types.ts";
import CastlingMove from "@/variants/standard/moves/CastlingMove.ts";

const playLine = (() => {
  const moveRegexp = /([NBRQK]?[a-h]?[1-8]?x?[a-h][1-8]|(?<o>0|O)(-\k<o>){1,2})/g;

  return (line: string, game: IChessGame) => {
    for (const { 0: substring, index } of line.matchAll(moveRegexp)) {
      const move = findMove(substring, game.currentPosition);
      if (!move) throw getMoveError({ substring, index: index!, line });
      game.playMove(move);
    }
  };
})();

function findMove(input: string, { legalMoves, board }: IPosition) {
  if (input.includes("-"))
    return legalMoves.find((move) => move instanceof CastlingMove && move.isQueenSide() === (input.length === 5));

  return legalMoves.find((move) => input.startsWith(move.algebraicNotation(board, legalMoves)));
}

export default function playMoves(movesStr: string, game: IChessGame) {
  let buffer = "";
  const stack: IPosition[] = [];

  for (let i = 0; i < movesStr.length; i++) {
    switch (movesStr[i]) {
      case "(":
        playLine(buffer, game);
        stack.push(game.currentPosition);
        game.goBack();
        buffer = "";
        break;
      case ")":
        playLine(buffer, game);
        game.currentPosition = stack.pop()!;
        buffer = "";
        break;
      case "{":
        playLine(buffer, game);
        buffer = "";
        break;
      case "}":
        game.currentPosition.comment = buffer;
        buffer = "";
        break;
      default:
        buffer += movesStr[i];
    }
  }

  playLine(buffer, game);
}

function getMoveError({ substring, index, line }: {
  substring: string;
  index: number;
  line: string;
}) {
  const startIndex = (index - 20 < 0) ? 0 : index - 20;
  return new Error(`Illegal move "${substring}" near "${line.slice(startIndex, index + 20)}".`);
}