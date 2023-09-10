import Color from "@/constants/Color.ts";
import { Coordinates } from "@/types/main-types.ts";
import CoordsFactory from "@/variants/shatranj/factories/CoordsFactory.ts";
import ShatranjPiece from "@/variants/shatranj/ShatranjPiece.ts";

export default class ShatranjBoard {
  public static readonly Coords: ReturnType<typeof CoordsFactory> = CoordsFactory(8, 8);
  public static readonly PieceConstructor: typeof ShatranjPiece = ShatranjPiece;

  public static fromString(str: string) {
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

  protected readonly pieces = new Map<Coordinates, ShatranjPiece>();
  protected readonly kingCoords = new Map<Color, Coordinates>();
  public readonly height: number = 8;
  public readonly width: number = 8;
  public readonly initialKingFile: number = 4;

  public get Coords() {
    return (this.constructor as typeof ShatranjBoard).Coords;
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

  public set(x: number, y: number, piece: ShatranjPiece) {
    return this.setByCoords(this.Coords(x, y), piece);
  }

  public setByCoords(coords: Coordinates, piece: ShatranjPiece) {
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
    const pieces: [Coordinates, ShatranjPiece][] = [];
    this.pieces.forEach((piece, coords) => {
      if (piece.color === color) pieces.push([coords, piece]);
    });
    return pieces;
  }

  public getNonKingPieces() {
    const pieces = new Map<Color, [Coordinates, ShatranjPiece][]>([
      [Color.WHITE, []],
      [Color.BLACK, []]
    ]);
    this.pieces.forEach((piece, coords) => {
      if (!piece.isKing())
        pieces.get(piece.color)!.push([coords, piece]);
    });
    return pieces;
  }

  public getKingCoords(color: Color) {
    return this.kingCoords.get(color)!;
  }

  protected *shortRangePieceAttackedCoords(srcCoords: Coordinates, { x: xOffsets, y: yOffsets }: ShatranjPiece["offsets"]) {
    for (let i = 0; i < xOffsets.length; i++) {
      const destCoords = srcCoords.getPeer(xOffsets[i], yOffsets[i]);
      if (destCoords) yield destCoords;
    }
  }

  protected *longRangePieceAttackedCoords(srcCoords: Coordinates, { x: xOffsets, y: yOffsets }: ShatranjPiece["offsets"]) {
    for (let i = 0; i < xOffsets.length; i++) {
      for (const destCoords of srcCoords.peers(xOffsets[i], yOffsets[i])) {
        yield destCoords;
        if (this.pieces.has(destCoords)) break;
      }
    }
  }

  public *attackedCoords(srcCoords: Coordinates) {
    const srcPiece = this.pieces.get(srcCoords)!;

    if (srcPiece.isShortRange()) {
      yield* this.shortRangePieceAttackedCoords(srcCoords, srcPiece.offsets);
      return;
    }

    yield* this.longRangePieceAttackedCoords(srcCoords, srcPiece.offsets);
  }

  public getAttackedCoordsSet(color: Color) {
    const set = new Set<Coordinates>();

    for (const [srcCoords] of this.getPiecesOfColor(color))
      for (const destCoords of this.attackedCoords(srcCoords))
        set.add(destCoords);

    return set;
  }

  public clone() {
    // `new Board([...this])` fails as `clone.kingCoords` isn't defined yet.
    const clone = new ShatranjBoard();
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