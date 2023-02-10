import File from "@chacomat/constants/File.js";
import { parsedMoves, parseVariations } from "@chacomat/pgn/variations.js";
import {
  ChessFileName,
  ChessGame,
  MoveFinder,
  PromotedPieceType
} from "@chacomat/types.local.js";
import Coords from "@chacomat/utils/Coords.js";
import { IllegalMoveError } from "@chacomat/utils/errors.js";

const checkRegex = /(\+{1,2}|#)?/;

const MOVE_FINDERS: Record<string, {
  regex: RegExp;
  getMove: MoveFinder;
}> = {
  PAWN_MOVE: {
    regex: new RegExp(`^(?<sf>[a-h])(x(?<df>[a-h]))?(?<dr>[1-8])(=?(?<pt>[QRNB]))?${checkRegex.source}$`),
    getMove: ({ sf, df, dr, pt }, board, legalMoves) => {
      const srcY = File[sf as ChessFileName];
      const destCoords = Coords.get(
        Coords.rankNameToX(dr),
        df ? File[df as ChessFileName] : srcY
      );

      const move = legalMoves.find(([src, dest]) => {
        const srcPiece = board.get(src);
        return srcPiece?.isPawn()
          && srcPiece.y === srcY
          && dest === destCoords;
      });

      if (!move) return null;
      return (pt != null)
        ? [...move, pt as PromotedPieceType]
        : move;
    }
  },
  PIECE_MOVE: {
    regex: new RegExp(`^(?<pt>[KQRBN])(?<sf>[a-h])?(?<sr>[1-8])?x?(?<df>[a-h])(?<dr>[1-8])${checkRegex.source}$`),
    getMove: ({ pt, sf, sr, df, dr }, board, legalMoves) => {
      const srcX = sr ? Coords.rankNameToX(sr) : null;
      const srcY = sf ? File[sf as ChessFileName] : null;
      const destCoords = Coords.get(
        Coords.rankNameToX(dr),
        File[df as ChessFileName]
      );

      return legalMoves.find(([src, dest]) => {
        const srcPiece = board.get(src);
        return srcPiece?.pieceClass.whiteInitial === pt
          && (srcX == null || srcPiece.x === srcX)
          && (srcY == null || srcPiece.y === srcY)
          && dest === destCoords;
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
      if (!destCoords)
        return null;
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
  let key: keyof typeof MOVE_FINDERS;

  for (key in MOVE_FINDERS) {
    const match = moveText.match(MOVE_FINDERS[key].regex);
    if (match) {
      const move = MOVE_FINDERS[key].getMove(
        match.groups,
        game.currentPosition.board,
        game.currentPosition.legalMoves
      );
      if (!move)
        throw new IllegalMoveError(moveText);
      game.move(...move);
      break;
    }
  }
}