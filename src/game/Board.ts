import Color from "@/constants/Color.ts";
import Coords from "@/constants/Coords.ts";
import { Piece } from "@/constants/Pieces.ts";

export default class Board extends Map<Coords, Piece> {
  public static fromString(str: string): Board {
    const { Piece, Coords } = this.prototype;

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

  protected readonly kingCoords = new Map<Color, Coords>();

  public get height() {
    return this.Coords.BOARD_HEIGHT;
  }

  public get width() {
    return this.Coords.BOARD_WIDTH;
  }

  public get initialKingFile() {
    return 4;
  }

  public get castlingMultiplier() {
    return 2;
  }

  public get Coords() {
    return Coords;
  }

  public get Piece() {
    return Piece;
  }

  public override set(coords: Coords, piece: Piece): this {
    if (piece.isKing())
      this.kingCoords.set(piece.color, coords);
    return super.set(coords, piece);
  }

  public getPiecesOfColor(color: Color) {
    const pieces: [Coords, Piece][] = [];
    this.forEach((piece, coords) => {
      if (piece.color === color) pieces.push([coords, piece]);
    });
    return pieces;
  }

  public getKingCoords(color: Color): Coords {
    return this.kingCoords.get(color)!;
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

  public *forwardPawnCoords(color: Color, srcCoords: Coords) {
    const destCoords1 = srcCoords.getPeer(color.direction, 0);

    if (destCoords1 && !this.has(destCoords1)) {
      yield destCoords1;

      if (srcCoords.x === color.getPawnRank(this.height)) {
        const destCoords2 = destCoords1.getPeer(color.direction, 0);
        if (destCoords2 && !this.has(destCoords2))
          yield destCoords2;
      }
    }
  }

  public getAttackedCoordsSet(color: Color) {
    const set = new Set<Coords>();

    for (const [srcCoords] of this.getPiecesOfColor(color))
      for (const destCoords of this.attackedCoords(srcCoords))
        set.add(destCoords);

    return set;
  }

  public canCastle(rookSrcY: number, color: Color, attackedCoordsSet: Set<Coords>): boolean {
    const kingSrcCoords = this.getKingCoords(color);
    const direction = Math.sign(rookSrcY - kingSrcCoords.y);
    const kingDestY = this.initialKingFile + this.castlingMultiplier * direction;
    const rookDestY = kingDestY - direction;

    if (kingDestY !== kingSrcCoords.y) {
      const yOffset = Math.sign(kingDestY - kingSrcCoords.y);
      let { y } = kingSrcCoords;
      do {
        y += yOffset;
        const coords = this.Coords.get(kingSrcCoords.x, y);
        if (this.has(coords) && y !== rookSrcY || attackedCoordsSet.has(coords))
          return false;
      } while (y !== kingDestY);
    }

    if (rookDestY !== rookSrcY) {
      const yOffset = Math.sign(rookDestY - rookSrcY);
      let y = rookSrcY;
      do {
        y += yOffset;
        const coords = this.Coords.get(kingSrcCoords.x, y);
        if (this.has(coords) && coords !== kingSrcCoords)
          return false;
      } while (y !== rookDestY);
    }

    return true;
  }

  public clone(): Board {
    // `new Board([...this])` fails as `clone.kingCoords` isn't defined yet.
    const clone = new (this.constructor as typeof Board)();
    this.forEach((piece, coords) => clone.set(coords, piece));
    return clone;
  }

  public override toString() {
    const { Coords } = this;

    return Array
      .from({ length: Coords.BOARD_HEIGHT }, (_, x) => {
        let row = "";
        for (let y = 0; y < Coords.BOARD_WIDTH; y++)
          row += this.get(Coords.get(x, y))?.initial ?? "0";
        return row.replace(/0+/g, (zeros) => String(zeros.length));
      })
      .join("/");
  }
}