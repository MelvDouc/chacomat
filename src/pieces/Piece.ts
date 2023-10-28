import Color from "@/board/Color.ts";
import { longRangePeers, shortRangePeers } from "@/coordinates/peers.ts";
import { ChacoMat } from "@/typings/chacomat.ts";

export default class Piece {
  static readonly #values = new Map<number, Piece>();
  static readonly #initials = new Map<string, Piece>();
  static readonly #shortRangeValues = new Set([-1, -2, -3, 1, 2, 3]);

  static fromInitial(initial: string) {
    return this.#initials.get(initial);
  }

  static fromWhiteInitialAndColor(whiteInitial: string, color: ChacoMat.Color) {
    return this.fromInitial(color.isWhite() ? whiteInitial : whiteInitial.toLowerCase());
  }

  readonly value: number;
  readonly initial: string;
  readonly color: ChacoMat.Color;
  readonly #whiteInitial: string;

  constructor({ value, initial }: {
    value: number;
    initial: string;
  }) {
    this.value = value;
    this.initial = initial;
    this.#whiteInitial = initial.toUpperCase();
    this.color = initial === this.#whiteInitial ? Color.WHITE : Color.BLACK;
    Piece.#values.set(value, this);
    Piece.#initials.set(initial, this);
  }

  get whiteInitial() {
    return this.#whiteInitial;
  }

  get opposite() {
    return Piece.#values.get(-this.value)!;
  }

  isPawn() {
    return this.#whiteInitial === "P";
  }

  isKing() {
    return this.#whiteInitial === "K";
  }

  isKnight() {
    return this.#whiteInitial === "N";
  }

  isBishop() {
    return this.#whiteInitial === "B";
  }

  isRook() {
    return this.#whiteInitial === "R";
  }

  isQueen() {
    return this.#whiteInitial === "Q";
  }

  isShortRange() {
    return Piece.#shortRangeValues.has(this.value);
  }

  getAttacks(board: ChacoMat.Board, srcCoords: ChacoMat.Coords) {
    if (this.isShortRange()) {
      const value = this.isPawn() ? this.value : Math.abs(this.value);
      return shortRangePeers[srcCoords.x][srcCoords.y][value];
    }

    const attackedCoords: ChacoMat.Coords[] = [];

    for (const peers of longRangePeers[srcCoords.x][srcCoords.y][Math.abs(this.value)]) {
      for (const peer of peers) {
        attackedCoords.push(peer);
        if (board.has(peer)) break;
      }
    }

    return attackedCoords;
  }

  toJSON(): ChacoMat.JSONPiece {
    return {
      initial: this.initial,
      color: this.color.name
    };
  }
}

export const Pieces = {
  WHITE_PAWN: new Piece({ value: 1, initial: "P" }),
  WHITE_KING: new Piece({ value: 2, initial: "K" }),
  WHITE_KNIGHT: new Piece({ value: 3, initial: "N" }),
  WHITE_BISHOP: new Piece({ value: 4, initial: "B" }),
  WHITE_ROOK: new Piece({ value: 5, initial: "R" }),
  WHITE_QUEEN: new Piece({ value: 6, initial: "Q" }),
  BLACK_PAWN: new Piece({ value: -1, initial: "p" }),
  BLACK_KING: new Piece({ value: -2, initial: "k" }),
  BLACK_KNIGHT: new Piece({ value: -3, initial: "n" }),
  BLACK_BISHOP: new Piece({ value: -4, initial: "b" }),
  BLACK_ROOK: new Piece({ value: -5, initial: "r" }),
  BLACK_QUEEN: new Piece({ value: -6, initial: "q" })
} as const;