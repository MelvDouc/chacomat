# Deno Chess
A chess application built in Deno.

## Tasks

- Pieces:
  - [X] Generate pseudo-legal moves
  - [X] Create `oppositeColor` getter
- Pawns:
  - [X] Create Pawn class
  - [X] Generate forward pawn moves
  - [X] Generate pawn captures
  - [X] Handle promotion
- King:
  - [X] Handle castling
  - [X] Keep track of index
- [X] Generate moves
- [X] Parse FEN
  - [X] Parse piece string
  - [X] Parse castling string
  - [X] Create position from FEN
  - [X] Create FEN from position 
- [ ] Move `getWing` to Wing.ts
### Things to update on move
- Pawn:
  - [X] double pawn move -> set e.p. file
  - [X] promotion -> change piece type
  - [X] e.p. capture -> remove captured pawn
- Rook:
  - [X] unset castling right on move
  - [X] unset castling right on captured
- King:
  - [X] unset castling rights on move
  - [X] move rook on castling

### Benches

- [ ] Write [benches][def]

[def]: https://deno.land/manual@main/tools/benchmarker