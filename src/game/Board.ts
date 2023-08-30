import Color from "@constants/Color.js";
import Piece from "@constants/Piece.js";
import Wing from "@constants/Wing.js";
import Coords from "@game/Coords.js";

export default class Board extends Map<Coords, Piece> {
  public static fromString(str: string): Board {
    return str
      .split("/")
      .reduce((acc, row, x) => {
        row
          .replace(/\d+/g, (n) => "0".repeat(+n))
          .split("")
          .forEach((initial, y) => {
            if (initial !== "0")
              acc.set(Coords.get(x, y), Piece.fromInitial(initial)!);
          });
        return acc;
      }, new this());
  }

  protected readonly kingCoords: Record<string, Coords> = {};

  public override set(coords: Coords, piece: Piece): this {
    if (piece.isKing())
      this.kingCoords[piece.color.abbreviation] = coords;
    return super.set(coords, piece);
  }

  public getPiecesOfColor(color: Color): Map<Coords, Piece> {
    const pieces = new Map<Coords, Piece>();
    this.forEach((piece, coords) => {
      if (piece.color === color) pieces.set(coords, piece);
    });
    return pieces;
  }

  public getKingCoords(color: Color): Coords {
    return this.kingCoords[color.abbreviation];
  }

  public *attackedCoords(srcCoords: Coords): Generator<Coords> {
    const srcPiece = this.get(srcCoords) as Piece;
    const { x: xOffsets, y: yOffsets } = srcPiece.offsets;

    for (let i = 0; i < xOffsets.length; i++) {
      for (const destCoords of srcCoords.peers(xOffsets[i], yOffsets[i])) {
        yield destCoords;
        if (srcPiece.isShortRange() || this.has(destCoords))
          break;
      }
    }
  }

  public *forwardPawnCoords(color: Color, srcCoords: Coords): Generator<Coords> {
    const destCoords1 = srcCoords.getPeer(color.direction, 0);

    if (destCoords1 && !this.has(destCoords1)) {
      yield destCoords1;

      if (srcCoords.x === color.initialPawnRank) {
        const destCoords2 = srcCoords.getPeer(color.direction * 2, 0);
        if (destCoords2 && !this.has(destCoords2))
          yield destCoords2;
      }
    }
  }

  public canCastleToWing(wing: Wing, rookSrcY: number, color: Color, attackedCoordsSet: Set<Coords>): boolean {
    const kingSrcCoords = this.kingCoords[color.abbreviation];
    const kingDirection = Math.sign(wing.castledKingY - kingSrcCoords.y);
    const rookDirection = Math.sign(wing.castledRookY - rookSrcY);

    if (kingDirection !== 0) {
      let { y } = kingSrcCoords;
      do {
        y += kingDirection;
        const coords = Coords.get(kingSrcCoords.x, y);
        if (this.has(coords) && coords.y !== rookSrcY || attackedCoordsSet.has(coords))
          return false;
      } while (y !== wing.castledKingY);
    }

    if (rookDirection !== 0) {
      let y = rookSrcY;
      do {
        y += rookDirection;
        const coords = Coords.get(kingSrcCoords.x, y);
        if (this.has(coords) && coords !== kingSrcCoords)
          return false;
      } while (y !== wing.castledRookY);
    }

    return true;
  }

  public clone(): Board {
    const clone = new Board();
    this.forEach((piece, coords) => clone.set(coords, piece));
    return clone;
  }

  public override toString() {
    return Array
      .from({ length: 8 }, (_, x) => {
        let row = "";
        for (let y = 0; y < 8; y++)
          row += this.get(Coords.get(x, y))?.initial ?? "0";
        return row.replace(/0+/g, (zeros) => String(zeros.length));
      })
      .join("/");
  }
}