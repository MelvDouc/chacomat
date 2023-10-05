# ChacoMat

A TypeScript chess game.

## Create a game

### By entering moves

```javascript
import { ChessGame, coords } from "chacomat";

const spanishGame = new ChessGame();

spanishGame
  .playMoveWithNotation("e2e4")
  .playMoveWithNotation("e7e5")
  .playMoveWithNotation("g1f3")
  .playMoveWithNotation("b8c6")
  .playMoveWithCoords(coords(7, 5), coords(3, 1));
```

### from a PGN

```javascript
const spanishGame = new ChessGame({
  pgn: `
    [White "Magnus Carlsen"]
    [Black "Ian Nepomniachtchi"]
    [Result "*"]

    1. e4 e5 2. Nf3 Nc6 3. Bb5 *
  `
});
```

## View Game

### PGN

```typescript
const pgn = game.toPGN();
```

### FEN

```typescript
const fen = game.currentPosition.toFEN();
```

### board

```typescript
const boardArray = game.currentPosition.board.toArray();
```

## Variants

Variants were removed in version 2.0.8 to be re-released as a separate package.
