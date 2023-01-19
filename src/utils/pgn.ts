import { Board, ChessFileName, ChessGame, Move } from "@chacomat/types.js";
import Color from "@chacomat/utils/Color.js";
import { Wing } from "@chacomat/utils/constants.js";
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
  getMove: (moveText: string, board: Board, legalMoves: Move[], color?: Color) => Move;
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
      const destY = Coords.File[moveText[1] as ChessFileName],
        destX = 8 - Number(moveText[2]);
      return legalMoves.find(([src, dest]) => {
        return dest.x === destX
          && dest.y === destY
          && board.get(src)?.type === moveText[0];
      })!;
    }
  },
  // FIXME
  AMBIGUOUS_PIECE_MOVE: {
    regex: /^[NBRQK][a-h]?[1-8]?x?[a-h][1-8](\+{1,2}|#)?$/,
    getMove: (moveText, board, legalMoves) => {
      const chars = moveText.replace("x", "").replace(checkRegex, "").split("");
      let srcX: number, srcY: number;
      const destY = Coords.File[chars.at(-2) as ChessFileName],
        destX = 8 - Number(chars.at(-1));
      if (chars.length === 4) {
        if (!isNaN(Number(chars[1])))
          srcY = Coords.File[chars[1] as ChessFileName];
        else
          srcX = 8 - Number(chars[1]);
      } else {
        srcY = Coords.File[chars[1] as ChessFileName];
        srcX = 8 - Number(chars[2]);
      }
      const move = legalMoves.find(([src, dest]) => {
        if (srcX !== undefined && src.x !== srcX)
          return false;
        if (srcY !== undefined && src.y !== srcY)
          return false;
        return dest.x === destX
          && dest.y === destY
          && board.get(src)?.type === moveText[0];
      })!;
      return move;
    }
  },
  CASTLING: {
    regex: new RegExp(`^${castlingRegex.source}$`),
    getMove: (moveText, board, legalMoves, color) => {
      const wing = (moveText.length === 3) ? Wing.QUEEN_SIDE : Wing.KING_SIDE;
      const castlingRights = board.position.castlingRights[color];
      const destY = (castlingRights.length === 1 || wing === Wing.QUEEN_SIDE)
        ? castlingRights[0]
        : castlingRights[1];
      const king = board.kings[color];
      return legalMoves.find(([src, dest]) => {
        return board.get(src) === king
          && dest.x === king.startRank
          && dest.y === destY;
      })!;
    }
  }
};

export function playMovesFromPgn(pgnStr: string, game: ChessGame) {
  const movePairs = pgnStr.match(moveRegex) as string[];

  movePairs.forEach((pair) => {
    const [whiteMove, blackMove] = pair.slice(pair.indexOf(".") + 1).trim().split(/\s+/);
    let key: keyof typeof HALF_MOVE_REGEXES;

    for (key in HALF_MOVE_REGEXES) {
      const { regex, getMove } = HALF_MOVE_REGEXES[key];
      if (regex.test(whiteMove)) {
        const move = getMove(whiteMove, game.currentPosition.board, game.currentPosition.legalMoves, Color.WHITE);
        game.move(move[0], move[1]);
        break;
      }
    }

    if (!blackMove)
      return;

    for (key in HALF_MOVE_REGEXES) {
      const { regex, getMove } = HALF_MOVE_REGEXES[key];
      if (regex.test(blackMove)) {
        const move = getMove(blackMove, game.currentPosition.board, game.currentPosition.legalMoves, Color.BLACK);
        game.move(move[0], move[1]);
        break;
      }
    }
  });
}