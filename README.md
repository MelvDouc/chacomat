# ChacoMat

An environment-independent TypeScript chess game.

## Getting started

```typescript
import { ChessGame } from "chacomat";

const spanishGame = new ChessGame();

spanishGame
  .moveWithNotations("e2", "e4")
  .moveWithNotations("e7", "e5")
  .moveWithNotations("g1", "f3")
  .moveWithNotations("b8", "c6")
  .moveWithNotations("f1", "b5");
```

## Create a game from an FEN string

```typescript
import { ChessGame } from "chacomat";

const spanishGame = new ChessGame({
  fenString: "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
  metaInfo: {
    whitePlayer: "Magnus Carlsen",
    blackPlayer: "Ian Nepomniachtchi"
  }
});
```

## Print board to console

```typescript
spanishGame.logBoard();
```

![log of a chessboard](https://i.imgur.com/96BdDi8.png "game.logBoard()")

## Get the pieces as an array

```typescript
const pieceArr = spanishGame.currentPosition.board.getArray();
console.log(pieceArr);
```

## Chess960

Also known as **Fischer random chess**.

```typescript
import { Chess960Game } from "chacomat";

const chess960Game = Chess960Game.getRandomStartPosition();
console.log(chess960Game.currentPosition.toString()); // e.g. "rbkrnqbn/pppppppp/8/8/8/8/PPPPPPPP/RBKRNQBN w ADad - 0 1"
```

Note how castling rights are noted using the rooks' initial files.