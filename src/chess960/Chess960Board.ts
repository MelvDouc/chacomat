import { colors } from "@chacomat/constants/Color.js";
import Board from "@chacomat/game/Board.js";
import Piece, { Pawn } from "@chacomat/pieces/index.js";
import { King, NonPawnPieceType } from "@chacomat/types.local.js";
import Coords from "@chacomat/utils/Coords.js";

export default class Chess960Board extends Board {
  static create(piecePlacement: Record<NonPawnPieceType, number[]>): Board {
    const board = new this();
    let pieceInitial: keyof typeof piecePlacement;

    for (const color of colors) {
      const pieceRank = Piece.START_RANKS[color];

      for (pieceInitial in piecePlacement) {
        for (const y of piecePlacement[pieceInitial]) {
          const coords = Coords.get(pieceRank, y);
          const type = Piece.pieceClassesByInitial.get(pieceInitial) as typeof King;
          const piece = new (type)(color);
          piece.coords = coords;
          piece.board = board;
          board.set(coords, piece);
        }
      }

      board.kings[color] = board.atX(pieceRank).atY(piecePlacement["K"][0]) as King;

      for (let y = 0; y < 8; y++) {
        const coords = Coords.get(Pawn.START_RANKS[color], y);
        const pawn = new Pawn(color);
        pawn.coords = coords;
        pawn.board = board;
        board.set(coords, pawn);
      }
    }

    return board;
  }
}