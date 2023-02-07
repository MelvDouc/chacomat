import File from "@chacomat/constants/File.js";
import {
  Board,
  ChessFileName,
  ChessGame,
  Move,
  PieceType,
  PromotedPieceType
} from "@chacomat/types.local.js";
import { coordsToIndex } from "@chacomat/utils/Index.js";
import { parsedMoves, parseVariations } from "@chacomat/utils/pgn/variations.js";

const checkRegex = /(\+{1,2}|#)?/;

// TODO: error handling
const HALF_MOVE_REGEXES: Record<string, {
  regex: RegExp;
  getMove: MoveFinder;
}> = {
  PAWN_MOVE: {
    regex: new RegExp(`^(?<sf>[a-h])(x(?<df>[a-h]))?(?<dr>[1-8])(=?(?<pt>[QRNB]))?${checkRegex.source}$`),
    getMove: (match, board, legalMoves) => {
      const { sf, df, dr, pt } = match;
      const srcY = File[sf as ChessFileName];
      const destX = getRank(dr);
      const destY = df ? File[df as ChessFileName] : srcY;
      const destIndex = coordsToIndex(destX, destY);

      const move = legalMoves.find(([src, dest]) => {
        const srcPiece = board.get(src);
        return srcPiece?.isPawn()
          && srcPiece.coords.y === srcY
          && dest === destIndex;
      });

      return (pt != null)
        ? [...move, pt as PromotedPieceType]
        : move;
    }
  },
  PIECE_MOVE: {
    regex: new RegExp(`^(?<pt>[KQRBN])(?<sf>[a-h])?(?<sr>[1-8])?x?(?<df>[a-h])(?<dr>[1-8])${checkRegex.source}$`),
    getMove: (match, board, legalMoves) => {
      const { pt, sf, sr, df, dr } = match;
      const pieceType = pt as PieceType;
      const srcX = sr ? getRank(sr) : null;
      const srcY = sf ? File[sf as ChessFileName] : null;
      const destX = getRank(dr);
      const destY = File[df as ChessFileName];
      const destIndex = coordsToIndex(destX, destY);

      return legalMoves.find(([src, dest]) => {
        const srcPiece = board.get(src);
        return srcPiece?.type === pieceType
          && (srcX == null || srcPiece.coords.x === srcX)
          && (srcY == null || srcPiece.coords.y === srcY)
          && dest === destIndex;
      });
    }
  },
  CASTLING: {
    regex: new RegExp(`^(?<t>O|0)-\\k<t>(?<t2>-\\k<t>)?${checkRegex.source}$`),
    getMove: (match, board) => {
      const kingIndex = board.kings[board.position.colorToMove].#index;
      const destIndex = [...board.position.castlingCoords()].find((index) => {
        return (match["t2"]) ? index < kingIndex : index > kingIndex;
      });
      return [kingIndex, destIndex];
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
    const match = moveText.match(HALF_MOVE_REGEXES[key].regex);
    if (match) {
      const move = HALF_MOVE_REGEXES[key].getMove(
        match.groups,
        game.currentPosition.board,
        game.currentPosition.legalMoves
      );
      game.move(...move);
      break;
    }
  }
}

function getRank(rankStr: string): number {
  return 8 - +rankStr;
}

type MoveMatch = {
  [x: string]: string | undefined;
};

type MoveFinder = (match: MoveMatch, board: Board, legalMoves?: Move[]) => [...Move, PromotedPieceType?];