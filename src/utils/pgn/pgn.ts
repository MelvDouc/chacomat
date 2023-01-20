import { AlgebraicSquareNotation, Board, ChessFileName, ChessGame, Move } from "@chacomat/types.js";
import { File } from "../constants.js";
import { coordsToIndex, indexToCoords, notationToIndex } from "../Index.js";

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
      const destIndex = notationToIndex(moveText as AlgebraicSquareNotation);
      return legalMoves.find(([src, dest]) => {
        return dest === destIndex
          && board.get(src)?.isPawn();
      });
    }
  },
  PAWN_CAPTURE: {
    regex: /^[a-h]x[a-h][1-8](\+{1,2}|#)?$/,
    getMove: (moveText, board, legalMoves) => {
      const srcY = File[moveText[0] as ChessFileName];
      const destIndex = notationToIndex(moveText[2] + moveText[3] as AlgebraicSquareNotation);
      return legalMoves.find(([src, dest]) => {
        return indexToCoords(src).x === srcY
          && dest === destIndex
          && board.get(src)?.isPawn();
      });
    }
  },
  CLEAR_PIECE_MOVE: {
    regex: /^[NBRQK]x?[a-h][1-8](\+{1,2}|#)?$/,
    getMove: (moveText, board, legalMoves) => {
      moveText = moveText.replace("x", "");
      const destIndex = notationToIndex(moveText[1] + moveText[2] as AlgebraicSquareNotation);
      return legalMoves.find(([src, dest]) => {
        return dest === destIndex
          && board.get(src)?.type === moveText[0];
      });
    }
  },
  AMBIGUOUS_PIECE_MOVE: {
    regex: /^[NBRQK][a-h]?[1-8]?x?[a-h][1-8](\+{1,2}|#)?$/,
    getMove: (moveText, board, legalMoves) => {
      const chars = moveText.replace("x", "").replace(checkRegex, "").split("");
      const destX = getRank(chars.at(-1));
      const destY = File[chars.at(-2) as ChessFileName];
      const destCoords = coordsToIndex(destX, destY);
      let srcX: number | undefined,
        srcY: number | undefined;

      if (chars.length === 5) {
        srcX = getRank(chars[2]);
        srcY = File[chars[1] as ChessFileName];
      } else {
        !isNaN(+chars[1])
          ? srcX = getRank(chars[1])
          : srcY = File[chars[1] as ChessFileName];
      }

      return legalMoves.find(([src, dest]) => {
        const srcCoords = indexToCoords(src);
        if (srcX != null && srcCoords.x !== srcX)
          return false;
        if (srcY != null && srcCoords.y !== srcY)
          return false;
        return destCoords === dest
          && board.get(src)?.type === moveText[0];
      });
    }
  },
  CASTLING: {
    regex: new RegExp(`^${castlingRegex.source + checkRegex.source}$`),
    getMove: (moveText, board, legalMoves) => {
      const kingIndex = board.kings[board.position.colorToMove].index;
      const destIndex = [...board.position.castlingCoords()].find((index) => {
        return (moveText.length === 3)
          ? index > kingIndex
          : index < kingIndex;
      });
      return legalMoves.find(([src, dest]) => src === kingIndex && dest === destIndex);
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

function getRank(rankStr: string): number {
  return 8 - +rankStr;
}