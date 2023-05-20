import Board from "@src/game/Board.js";
import ChessGame from "@src/game/ChessGame.js";
import parseVariations from "@src/pgn-fen/parse-variations.js";

const board = new Board("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
board.log();

const pgn = `
  1.e4 e5
    ( 1...c5 2.f4
      ( 2.Nc3 )
    2...e6 )
    ( 1...c6 )
  2.Nf3 Nc6 3.Bb5 a6 *
`;
const game = new ChessGame({ pgn });
console.log(
  parseVariations(pgn)
);
game.currentPosition.board.log();