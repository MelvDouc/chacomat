import File from "@chacomat/constants/File.js";
import {
  Board,
  ChessFileName,
  ChessGame,
  Move,
  PromotedPieceType
} from "@chacomat/types.local.js";
import { coordsToIndex } from "@chacomat/utils/Index.js";
import { parsedMoves, parseVariations } from "@chacomat/utils/pgn/variations.js";

const checkRegex = /(\+{1,2}|#)?/;

// TODO: error handling
const HALF_MOVE_REGEXPS: Record<string, {
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
        return srcPiece?.pieceName === "Pawn"
          && srcPiece.getCoords().y === srcY
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
      const pieceType = pt;
      const srcX = sr ? getRank(sr) : null;
      const srcY = sf ? File[sf as ChessFileName] : null;
      const destX = getRank(dr);
      const destY = File[df as ChessFileName];
      const destIndex = coordsToIndex(destX, destY);

      return legalMoves.find(([src, dest]) => {
        const srcPiece = board.get(src);
        return srcPiece?.pieceClass.whiteInitial === pieceType
          && (srcX == null || srcPiece.getCoords().x === srcX)
          && (srcY == null || srcPiece.getCoords().y === srcY)
          && dest === destIndex;
      });
    }
  },
  CASTLING: {
    regex: new RegExp(`^(?<t>O|0)-\\k<t>(?<t2>-\\k<t>)?${checkRegex.source}$`),
    getMove: (match, board) => {
      const king = board.kings[board.position.colorToMove];
      const destIndex = [...board.position.castlingIndices()].find((index) => {
        return (match["t2"])
          ? index < king.getIndex()
          : index > king.getIndex();
      });
      return [king.getIndex(), destIndex];
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
  let key: keyof typeof HALF_MOVE_REGEXPS;

  for (key in HALF_MOVE_REGEXPS) {
    const match = moveText.match(HALF_MOVE_REGEXPS[key].regex);
    if (match) {
      const move = HALF_MOVE_REGEXPS[key].getMove(
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