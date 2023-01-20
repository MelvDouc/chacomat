import File from "@chacomat/constants/File.js";
import {
  AlgebraicSquareNotation,
  Board,
  ChessFileName,
  ChessGame,
  Move,
  PromotedPieceType
} from "@chacomat/types.js";
import {
  coordsToIndex,
  indexToCoords,
  notationToIndex
} from "@chacomat/utils/Index.js";
import { parsedMoves, parseVariations } from "@chacomat/utils/pgn/variations.js";

const castlingRegex = /(0-0(-0)?|O-O(-O)?)/;
const checkRegex = /(\+{1,2}|#)?/;

// TODO: include promotion
const HALF_MOVE_REGEXES: Record<string, {
  regex: RegExp;
  getMove: (moveText: string, board: Board, legalMoves: Move[]) => [...Move, PromotedPieceType?];
}> = {
  STRAIGHT_PAWN_MOVE: {
    regex: /^[a-h][1-8](\+{1,2}|#)?$/,
    getMove: (moveText, board, legalMoves) => {
      const destIndex = notationToIndex(moveText[0] + moveText[1] as AlgebraicSquareNotation);
      return legalMoves.find(([src, dest]) => dest === destIndex && board.get(src)?.isPawn());
    }
  },
  PAWN_CAPTURE: {
    regex: /^[a-h]x[a-h][1-8](\+{1,2}|#)?$/,
    getMove: (moveText, board, legalMoves) => {
      const srcY = File[moveText[0] as ChessFileName];
      const destIndex = notationToIndex(moveText[2] + moveText[3] as AlgebraicSquareNotation);
      return legalMoves.find(([src, dest]) => {
        return dest === destIndex
          && indexToCoords(src).y === srcY
          && board.get(src)?.isPawn();
      });
    }
  },
  CLEAR_PIECE_MOVE: {
    regex: /^[NBRQK]x?[a-h][1-8](\+{1,2}|#)?$/,
    getMove: (moveText, board, legalMoves) => {
      moveText = moveText.replace("x", "");
      const destIndex = notationToIndex(moveText[1] + moveText[2] as AlgebraicSquareNotation);
      return legalMoves.find(([src, dest]) => dest === destIndex && board.get(src)?.type === moveText[0]);
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
        return destCoords === dest
          && board.get(src)?.type === moveText[0]
          && (srcX == null || srcX === indexToCoords(src).x)
          && (srcY == null || srcY === indexToCoords(src).y);
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

// TODO: play variations
export function playMovesFromPgn(movesStr: string, game: ChessGame) {
  const mainLine = parseVariations(movesStr);

  for (let moveText of parsedMoves(mainLine.movesStr)) {
    moveText = moveText.slice(moveText.lastIndexOf(".") + 1).trim();

    if (moveText.includes("...")) {
      findAndPlayMove(moveText, game);
      continue;
    }

    const [whiteMove, blackMove] = moveText.split(/\s+/);
    findAndPlayMove(whiteMove, game);
    if (blackMove)
      findAndPlayMove(blackMove, game);
  }
}

function findAndPlayMove(moveText: string, game: ChessGame) {
  let key: keyof typeof HALF_MOVE_REGEXES;

  for (key in HALF_MOVE_REGEXES) {
    if (HALF_MOVE_REGEXES[key].regex.test(moveText)) {
      const move = HALF_MOVE_REGEXES[key].getMove(moveText, game.currentPosition.board, game.currentPosition.legalMoves);
      game.move(...move);
      break;
    }
  }
}

function getRank(rankStr: string): number {
  return 8 - +rankStr;
}