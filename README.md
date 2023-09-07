# ChacoMat

A TypeScript chess game.

## Creating a game

### By entering moves

```javascript
import { ChessGame } from "chacomat";

const spanishGame = new ChessGame();

spanishGame
  .playMoveWithNotation("e2e4")
  .playMoveWithNotation("e7e5")
  .playMoveWithNotation("g1f3")
  .playMoveWithNotation("b8c6")
  .playMoveWithNotation("f1b5");
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

## Variants

### Chess960

Also known as **Fischer random chess**.

```javascript
import { Chess960Game } from "chacomat";

const chess960Game = new Chess960Game();
console.log(chess960Game.currentPosition.toString()); // e.g. "rbkrnqbn/pppppppp/8/8/8/8/PPPPPPPP/RBKRNQBN w ADad - 0 1"
```

Note how castling rights are noted using the rooks' initial files.

### Capablanca Chess

[Capablanca Chess](https://en.wikipedia.org/wiki/Capablanca_chess) is also available.

```javascript
import { CapablancaChessGame } from "chacomat";
```
