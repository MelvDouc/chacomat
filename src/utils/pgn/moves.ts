import File from "@chacomat/constants/File.js";
import {
  Board,
  ChessFileName,
  ChessGame,
  Move,
  PromotedPieceType
} from "@chacomat/types.local.js";
import { parsedMoves, parseVariations } from "@chacomat/utils/pgn/variations.js";
import { rankNameToX } from "../Index.js";

const checkRegex = /(\+{1,2}|#)?/;

// TODO: error handling
const HALF_MOVE_REGEXPS: Record<string, {
  regex: RegExp;
  getMove: MoveFinder;
}> = {
  PAWN_MOVE: {
    regex: new RegExp(`^(?<sf>[a-h])(x(?<df>[a-h]))?(?<dr>[1-8])(=?(?<pt>[QRNB]))?${checkRegex.source}$`),
    getMove: ({ sf, df, dr, pt }, board, legalMoves) => {
      const srcY = File[sf as ChessFileName];
      const destX = rankNameToX(dr);
      const destY = df ? File[df as ChessFileName] : srcY;

      const move = legalMoves.find(([src, dest]) => {
        const srcPiece = board.get(src);
        return srcPiece?.pieceName === "Pawn"
          && srcPiece.y === srcY
          && dest.x === destX
          && dest.y === destY;
      });

      return (pt != null)
        ? [...move, pt as PromotedPieceType]
        : move;
    }
  },
  PIECE_MOVE: {
    regex: new RegExp(`^(?<pt>[KQRBN])(?<sf>[a-h])?(?<sr>[1-8])?x?(?<df>[a-h])(?<dr>[1-8])${checkRegex.source}$`),
    getMove: ({ pt, sf, sr, df, dr }, board, legalMoves) => {
      const srcX = sr ? rankNameToX(sr) : null;
      const srcY = sf ? File[sf as ChessFileName] : null;
      const destX = rankNameToX(dr);
      const destY = File[df as ChessFileName];

      return legalMoves.find(([src, dest]) => {
        const srcPiece = board.get(src);
        return srcPiece?.pieceClass.whiteInitial === pt
          && (srcX == null || srcPiece.x === srcX)
          && (srcY == null || srcPiece.y === srcY)
          && dest.x === destX
          && dest.y === destY;
      });
    }
  },
  CASTLING: {
    regex: new RegExp(`^(?<t>O|0)-\\k<t>(?<t2>-\\k<t>)?${checkRegex.source}$`),
    getMove: ({ t2 }, board) => {
      const king = board.kings[board.position.colorToMove];
      const destCoords = [...board.position.castlingCoords()].find(({ y }) => {
        return (t2) ? (y < king.y) : (y > king.y);
      });
      return [king.coords, destCoords];
    }
  }
};

// TODO: play variations
export function playMovesFromPgn(movesStr: string, game: ChessGame) {
  const mainLine = parseVariations(movesStr);

  for (let moveText of parsedMoves(mainLine.movesAsString)) {
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

type MoveMatch = {
  [x: string]: string | undefined;
};

type MoveFinder = (match: MoveMatch, board: Board, legalMoves?: Move[]) => [...Move, PromotedPieceType?];