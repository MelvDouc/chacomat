# ChacoMat

An environment-independent TypeScript chess game

## Getting started

```typescript
import { ChessGame } from "chacomat";

const spanishGame = new ChessGame();

spanishGame
  .moveWithNotations("e2", "e4")
  .moveWithNotations("e7", "e5")
  .moveWithNotations("g1", "f3")
  .moveWithNotations("b8", "c8")
  .moveWithNotations("f1", "b5");

spanishGame.logBoard();
```
