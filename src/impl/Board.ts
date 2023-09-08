import CoordsFactory from "@/factories/CoordsFactory.ts";
import Color from "@/impl/Color.ts";
import Piece from "@/impl/Piece.ts";
import { Coordinates, Figure } from "@/types/types.ts";

export default class Board {
  public static readonly Coords: ReturnType<typeof CoordsFactory> = CoordsFactory(8, 8);
  public static readonly PieceConstructor: typeof Piece = Piece;

  public static fromString(str: string): Board {

    return str
      .split("/")
      .reduce((acc, row, x) => {
        row
          .replace(/\d+/g, (n) => "0".repeat(+n))
          .split("")
          .forEach((initial, y) => {
            if (initial !== "0")
              acc.set(x, y, this.PieceConstructor.fromInitial(initial)!);
          });
        return acc;
      }, new this());
  }

  protected readonly pieces = new Map<Coordinates, Figure>();
  protected readonly kingCoords = new Map<Color, Coordinates>();
  public readonly height: number = 8;
  public readonly width: number = 8;
  public readonly initialKingFile: number = 4;
  public readonly castlingMultiplier: number = 2;

  public get Coords() {
    return (this.constructor as typeof Board).Coords;
  }

  public get size() {
    return this.pieces.size;
  }

  public has(x: number, y: number) {
    return this.pieces.has(this.Coords(x, y));
  }

  public hasCoords(coords: Coordinates) {
    return this.pieces.has(coords);
  }

  public get(x: number, y: number) {
    return this.pieces.get(this.Coords(x, y)) ?? null;
  }

  public getByCoords(coords: Coordinates) {
    return this.pieces.get(coords) ?? null;
  }

  public set(x: number, y: number, piece: Figure) {
    return this.setByCoords(this.Coords(x, y), piece);
  }

  public setByCoords(coords: Coordinates, piece: Figure) {
    if (piece.isKing())
      this.kingCoords.set(piece.color, coords);
    this.pieces.set(coords, piece);
    return this;
  }

  public delete(x: number, y: number) {
    this.pieces.delete(this.Coords(x, y));
    return this;
  }

  public deleteCoords(coords: Coordinates) {
    this.pieces.delete(coords);
    return this;
  }

  public getPiecesOfColor(color: Color) {
    const pieces: [Coordinates, Figure][] = [];
    this.pieces.forEach((piece, coords) => {
      if (piece.color === color) pieces.push([coords, piece]);
    });
    return pieces;
  }

  public getKingCoords(color: Color) {
    return this.kingCoords.get(color)!;
  }

  public *attackedCoords(srcCoords: Coordinates) {
    const srcPiece = this.pieces.get(srcCoords)!;
    const { x: xOffsets, y: yOffsets } = srcPiece.offsets;

    for (let i = 0; i < xOffsets.length; i++) {
      for (const destCoords of srcCoords.peers(xOffsets[i], yOffsets[i])) {
        yield destCoords;
        if (srcPiece.isShortRange() || this.pieces.has(destCoords))
          break;
      }
    }
  }

  public getAttackedCoordsSet(color: Color) {
    const set = new Set<Coordinates>();

    for (const [srcCoords] of this.getPiecesOfColor(color))
      for (const destCoords of this.attackedCoords(srcCoords))
        set.add(destCoords);

    return set;
  }

  public canCastle(rookSrcY: number, color: Color, attackedCoordsSet: Set<Coordinates>): boolean {
    const kingSrcCoords = this.getKingCoords(color);
    const direction = Math.sign(rookSrcY - kingSrcCoords.y);
    const kingDestY = this.initialKingFile + this.castlingMultiplier * direction;
    const rookDestY = kingDestY - direction;

    if (kingDestY !== kingSrcCoords.y) {
      const yOffset = Math.sign(kingDestY - kingSrcCoords.y);
      let { y } = kingSrcCoords;
      do {
        y += yOffset;
        const coords = this.Coords(kingSrcCoords.x, y);
        if (this.hasCoords(coords) && y !== rookSrcY || attackedCoordsSet.has(coords))
          return false;
      } while (y !== kingDestY);
    }

    if (rookDestY !== rookSrcY) {
      const yOffset = Math.sign(rookDestY - rookSrcY);
      let y = rookSrcY;
      do {
        y += yOffset;
        if (this.has(kingSrcCoords.x, y) && y !== kingSrcCoords.y)
          return false;
      } while (y !== rookDestY);
    }

    return true;
  }

  public clone() {
    // `new Board([...this])` fails as `clone.kingCoords` isn't defined yet.
    const clone = new (this.constructor as typeof Board)();
    this.pieces.forEach((piece, coords) => clone.setByCoords(coords, piece));
    return clone;
  }

  public toString() {
    return Array
      .from({ length: this.height }, (_, x) => {
        let row = "";
        for (let y = 0; y < this.width; y++)
          row += this.get(x, y)?.initial ?? "0";
        return row.replace(/0+/g, (zeros) => String(zeros.length));
      })
      .join("/");
  }

  public toJson() {
    return Array.from({ length: this.height }, (_, x) => {
      return Array.from({ length: this.width }, (_, y) => {
        return this.get(x, y)?.toJson() ?? null;;
      });
    });
  }
}