import { Board, ChessFileName, ChessGame, Move } from "@chacomat/types.js";
import Coords from "@chacomat/utils/Coords.js";

const pawnMoveRegex = /[a-h](x[a-h])?[1-8](=?[NBRQ])?/,
  pieceMoveRegex = /[NBRQK][a-h]?[1-8]?x?[a-h][1-8]/,
  castlingRegex = /(0-0(-0)?|O-O(-O)?)/,
  checkRegex = /(\+{1,2}|#)?/,
  halfMove = `(${pawnMoveRegex.source}|${pieceMoveRegex.source}|${castlingRegex.source})`,
  halfMoveAndCheckRegex = halfMove + checkRegex.source;
const moveRegex = new RegExp(`(?<=\\d+\\.\\s*)${halfMoveAndCheckRegex}(\\s+${halfMoveAndCheckRegex})?`, "g");

// TODO: include promotion
const HALF_MOVE_REGEXES: Record<string, {
  regex: RegExp;
  getMove: (moveText: string, board: Board, legalMoves: Move[]) => Move;
}> = {
  STRAIGHT_PAWN_MOVE: {
    regex: /^[a-h][1-8](\+{1,2}|#)?$/,
    getMove: (moveText, board, legalMoves) => {
      const y = Coords.File[moveText[0] as ChessFileName],
        destX = 8 - Number(moveText[1]);
      return legalMoves.find(([src, dest]) => {
        return dest.x === destX
          && dest.y === y
          && board.get(src)?.isPawn();
      })!;
    }
  },
  PAWN_CAPTURE: {
    regex: /^[a-h]x[a-h][1-8](\+{1,2}|#)?$/,
    getMove: (moveText, board, legalMoves) => {
      const srcY = Coords.File[moveText[0] as ChessFileName],
        destY = Coords.File[moveText[2] as ChessFileName],
        destX = 8 - Number(moveText[3]);
      return legalMoves.find(([src, dest]) => {
        return dest.x === destX
          && src.y === srcY
          && dest.y === destY
          && board.get(src)?.isPawn();
      })!;
    }
  },
  CLEAR_PIECE_MOVE: {
    regex: /^[NBRQK]x?[a-h][1-8](\+{1,2}|#)?$/,
    getMove: (moveText, board, legalMoves) => {
      moveText = moveText.replace("x", "");
      const destX = 8 - +moveText[2];
      const destY = Coords.File[moveText[1] as ChessFileName];
      return legalMoves.find(([src, dest]) => {
        return dest.x === destX
          && dest.y === destY
          && board.get(src)?.type === moveText[0];
      })!;
    }
  },
  AMBIGUOUS_PIECE_MOVE: {
    regex: /^[NBRQK][a-h]?[1-8]?x?[a-h][1-8](\+{1,2}|#)?$/,
    getMove: (moveText, board, legalMoves) => {
      const chars = moveText.replace("x", "").replace(checkRegex, "").split("");
      const destX = 8 - +chars.at(-1);
      const destY = Coords.File[chars.at(-2) as ChessFileName];
      let srcX: number | undefined,
        srcY: number | undefined;

      if (chars.length === 5) {
        srcX = 8 - +chars[2];
        srcY = Coords.File[chars[1] as ChessFileName];
      } else {
        !isNaN(+chars[1])
          ? srcX = 8 - +chars[1]
          : srcY = Coords.File[chars[1] as ChessFileName];
      }

      return legalMoves.find(([src, dest]) => {
        if (srcX != null && src.x !== srcX)
          return false;
        if (srcY != null && src.y !== srcY)
          return false;
        return dest.x === destX
          && dest.y === destY
          && board.get(src)?.type === moveText[0];
      })!;
    }
  },
  CASTLING: {
    regex: new RegExp(`^${castlingRegex.source + checkRegex.source}$`),
    getMove: (moveText, board, legalMoves) => {
      const kingCoords = board.kings[board.position.colorToMove].coords;
      const destCoords = [...board.position.castlingCoords()].find((coords) => {
        return (moveText.length === 3)
          ? coords.y > kingCoords.y
          : coords.y < kingCoords.y;
      });
      return legalMoves.find(([src, dest]) => src === kingCoords && dest === destCoords);
    }
  }
};

export function playMovesFromPgn(pgnStr: string, game: ChessGame) {
  (pgnStr.match(moveRegex) as string[]).forEach((pair) => {
    const [whiteMove, blackMove] = pair.slice(pair.indexOf(".") + 1).trim().split(/\s+/);
    findAndPlayMove(whiteMove, game);
    if (blackMove)
      findAndPlayMove(blackMove, game);
  });
}

function findAndPlayMove(moveText: string, game: ChessGame) {
  let key: keyof typeof HALF_MOVE_REGEXES;

  for (key in HALF_MOVE_REGEXES) {
    const { regex, getMove } = HALF_MOVE_REGEXES[key];
    if (regex.test(moveText)) {
      const move = getMove(moveText, game.currentPosition.board, game.currentPosition.legalMoves);
      game.move(move[0], move[1]);
      break;
    }
  }
}