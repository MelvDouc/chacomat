import Color from "@/impl/Color.ts";
import { Figure } from "@/types/types.ts";

export const absolutePieceValues = {
  PAWN: 1,
  KING: 2,
  KNIGHT: 3,
  BISHOP: 4,
  ROOK: 5,
  QUEEN: 6
} as const;

export default function PieceFactory<TPieces extends Record<string, Pick<Figure, "value" | "initial" | "offsets">>>({ pieces, shortRangeValues }: {
  shortRangeValues: Set<number>;
  pieces: { [K in keyof TPieces]: TPieces[K] };
}) {
  const Piece = class implements Figure {
    public static get Pieces() {
      return Pieces;
    }

    public static fromValue(value: number) {
      return fromValue(PieceValues, value);
    }

    public static fromInitial(initial: string) {
      return PieceValues.find((piece) => piece.initial === initial);
    }

    public readonly value: number;
    public readonly initial: string;

    public constructor(
      value: number,
      initial: string,
      offsets: Figure["offsets"]
    ) {
      this.value = value;
      this.initial = initial;
      Offsets.set(value, offsets);
    }

    public get color() {
      return this.value < 0 ? Color.BLACK : Color.WHITE;
    }

    public get offsets() {
      return Offsets.get(this.value)!;
    }

    public get opposite() {
      return fromValue(PieceValues, -this.value)!;
    }

    public isPawn() {
      return Math.abs(this.value) === absolutePieceValues.PAWN;
    }

    public isKing() {
      return Math.abs(this.value) === absolutePieceValues.KING;
    }

    public isKnight() {
      return Math.abs(this.value) === absolutePieceValues.KNIGHT;
    }

    public isBishop() {
      return Math.abs(this.value) === absolutePieceValues.BISHOP;
    }

    public isRook() {
      return Math.abs(this.value) === absolutePieceValues.ROOK;
    }

    public isQueen() {
      return Math.abs(this.value) === absolutePieceValues.QUEEN;
    }

    public isShortRange() {
      return shortRangeValues.has(Math.abs(this.value));
    }

    public toJson() {
      return {
        initial: this.initial,
        color: this.color.abbreviation,
      };
    }
  };

  const Offsets = new Map<number, Figure["offsets"]>();
  const Pieces = Object.entries(pieces).reduce((acc, [name, { initial, value, offsets }]) => {
    acc[name as keyof TPieces] = new Piece(value, initial, offsets);
    return acc;
  }, {} as { [K in keyof TPieces]: Figure });
  const PieceValues = Object.values(Pieces);

  return Piece;
}

function fromValue(Pieces: Figure[], value: number) {
  return Pieces.find((piece) => piece.value === value);
}