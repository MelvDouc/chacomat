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
  .playMoveWithCoords(5, 7, 1, 3); // Bf1b5
```

### from headers

```javascript
const spanishGame = new ChessGame({
  White: "Magnus Carlsen",
  Black: "Ian Nepomniachtchi",
  Result: "*"
});
```

### from a PGN

```javascript
const spanishGame = new ChessGame(`
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

### move list

The `Position` class comes with a `toTree` method, which returns a linked list of sorts that can be used to iterate over each individual move notation. This may come in handy to create a navigable PGN.

```tsx
// React component
function MoveTag({ text, handleClick }: {
  text: string;
  handleClick: VoidFunction;
}) {
  return (
    <span className="moveTag" onClick={handleClick}>{text}</span>
  );
}

function Pgn({ position, notation, variations, next, game }: {
  game: ChacoMat.ChessGame;
} & ChacoMat.MoveTree) {
  const goToPosition = () => {
    game.currentPosition = position;
  };

  return (
    <>
      <MoveTag text={notation} handleClick={goToPosition} />
      {variations && variations.map((variation) => (
        <>( <Pgn {...variation} game={game} /> )</>
      ))}
      {next && <Pgn {...next} game={game} />}
    </>
  );
}
```

## Typings

Types can be imported under the `ChacoMat` namespace.

```typescript
import type { ChacoMat } from "chacomat";

ChacoMat.GameResult; // "1-0" | "0-1" | "1/2-1/2" | "0-0" | "*"
```

Most components of the game (coordinates, board, move, piece, position) can be serialized, for example, to be sent as a JSON response.

```typescript
// Express server
import { type ChacoMat, Position } from "chacomat";

router.get("/:fen", (request, response) => {
  const position = Position.fromFEN(request.params.fen);
  response.json(position.toJSON()); // ChacoMat.JSONPosition
});
```

## Customization

Some features of the game can be customized.

```javascript
import { globalConfig as chacomatConfig } from "chacomat";

chacomatConfig.useZerosForCastling = false;
chacomatConfig.useDoublePlusForCheckmate = true;
```

## Variants

Variants were removed in version 2.0.8 to be re-released as a separate package.
