# ChacoMat

An TypeScript chess game.

## Creating a game

### By entering moves

```javascript
import { ChessGame } from "chacomat";

const spanishGame = new ChessGame();

spanishGame
  .playMoveWithNotations("e2", "e4")
  .playMoveWithNotations("e7", "e5")
  .playMoveWithNotations("g1", "f3")
  .playMoveWithNotations("b8", "c6")
  .playMoveWithNotations("f1", "b5");
```

### from an FEN string

```javascript
const spanishGame = new ChessGame({
  fen: "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
  metaInfo: {
    White: "Magnus Carlsen",
    Black: "Ian Nepomniachtchi"
  }
});
```

### from a PGN

```javascript
const spanishGame = new ChessGame({
  pgn: `
    [White "Magnus Carlsen"]
    [Black "Ian Nepomniachtchi"]

    1. e4 e5 2. Nf3 Nc6 3. Bb5
`
});
```

## Chess960

Also known as **Fischer random chess**.

```javascript
import { Chess960Game } from "chacomat";

const chess960Game = new Chess960Game();
console.log(chess960Game.currentPosition.toString()); // e.g. "rbkrnqbn/pppppppp/8/8/8/8/PPPPPPPP/RBKRNQBN w ADad - 0 1"
```

Note how castling rights are noted using the rooks' initial files.

## Various features

### Print board to console

```javascript
spanishGame.currentPosition.board.log();
```

![log of a chessboard](https://i.imgur.com/96BdDi8.png "game.logBoard()")

### Get the pieces as an array

```javascript
const pieceArr = spanishGame.currentPosition.board.toArray();
console.table(pieceArr);
```