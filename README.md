# ChacoMat

A TypeScript chess game.

## Create a game

### By entering moves

```javascript
import { ChessGame, coords } from "chacomat";

const game = new ChessGame();
const move_e4 = game.currentPosition.findMoveByNotation("e4");
if (move_e4)
  game.playMove(move_e4);
```

### from headers

```javascript
const spanishGame = new ChessGame({
  info: {
    White: "Magnus Carlsen",
    Black: "Ian Nepomniachtchi",
    Result: "*"
  },
  moveString: "1.e4 e5 2.Nf3 Nc6 3.Bb5 *"
});
```

### from a PGN

```javascript
const spanishGame = ChessGame.fromPGN(`
  [White "Magnus Carlsen"]
  [Black "Ian Nepomniachtchi"]
  [Result "*"]

  1. e4 e5 2. Nf3 Nc6 3. Bb5 *
`);
```

## View Game

### PGN

```javascript
const pgn = game.toPGN();
```

### FEN

```javascript
const fen = game.currentPosition.toFEN();
```

### board

```javascript
game.currentPosition.board.log();

/*
8 | r n b q k b n r
7 | p p p p p p p p
6 | - - - - - - - -
5 | - - - - - - - -
4 | - - - - - - - -
3 | - - - - - - - -
2 | P P P P P P P P
1 | R N B Q K B N R
    - - - - - - - -
    a b c d e f g h
*/
```

## Typings

Types can be imported under the `ChacoMat` namespace.

```typescript
import type { ChacoMat } from "chacomat";

ChacoMat.GameResult; // "1-0" | "0-1" | "1/2-1/2" | "*"
```

Most components of the game (board, piece, position) can be serialized, for example, to be sent as a JSON response.

```typescript
// Express server
import { type ChacoMat, Position } from "chacomat";

router.get("/:fen", (request, response) => {
  const position = Position.fromFEN(request.params.fen);
  response.json(position.toJSON());
});
```

## Customization

Some features of the game can be customized.

```javascript
import { globalConfig as chacomatConfig } from "chacomat";

chacomatConfig.checkmateSign = "++";
chacomatConfig.castlingCharacter = "O";
```

## Variants

Variants were removed in version 2.0.8 to be re-released as a separate package.
