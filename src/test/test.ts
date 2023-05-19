import Board from "@src/game/Board.js";
import ChessGame from "@src/game/ChessGame.js";

const board = new Board("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
board.log();

const game = new ChessGame({
  pgn: `
    1.e4 e5
      ( 1...c5 2.f4
        ( 2.Nc3 )
      2...e6 )
      ( 1...c6 )
    2.Nf3 Nc6 3.Bb5 a6 *
  `
});
console.log(game.toString());