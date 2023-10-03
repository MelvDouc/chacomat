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
  info: {
    FEN: "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b kqKQ - 3 3",
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

Variants were removed in version 2.0.8 to be re-released as a separate package.
