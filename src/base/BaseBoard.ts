import BasePiece from "@/base/BasePiece.ts";
import Coords from "@/base/Coords.ts";
import Color from "@/constants/Color.ts";

export default class BaseBoard<TPiece extends BasePiece = BasePiece> {
  protected readonly pieces = new Map<Coords, TPiece>();
  protected readonly kingCoords = new Map<Color, Coords>();
  public readonly height: number = 8;
  public readonly width: number = 8;

  public get PieceConstructor(): typeof BasePiece {
    return BasePiece;
  }

  public get Coords() {
    return Coords;
  }

  public addPiecesFromString(boardStr: string) {
    boardStr
      .replace(/\d+/g, (n) => "0".repeat(+n))
      .split("/")
      .forEach((row, x) => {
        row
          .split("")
          .forEach((initial, y) => {
            if (initial !== "0")
              this.set(this.Coords.get(x, y), this.PieceConstructor.fromInitial(initial) as TPiece);
          });
      });
    return this;
  }

  // ===== ===== ===== ===== =====
  // BOARD ACCESSORS
  // ===== ===== ===== ===== =====

  public has(coords: Coords) {
    return this.pieces.has(coords);
  }

  public get(coords: Coords) {
    return this.pieces.get(coords) ?? null;
  }

  public set(coords: Coords, piece: TPiece) {
    this.pieces.set(coords, piece);
    if (piece.isKing()) this.kingCoords.set(piece.color, coords);
    return this;
  }

  public delete(coords: Coords) {
    this.pieces.delete(coords);
    return this;
  }

  public at(x: number, y: number) {
    return this.get(this.Coords.get(x, y));
  }

  public getPieceCount() {
    return this.pieces.size;
  }

  // ===== ===== ===== ===== =====
  // GETTERS
  // ===== ===== ===== ===== =====

  public getKingCoords(color: Color) {
    return this.kingCoords.get(color)!;
  }

  public getPiecesOfColor(color: Color) {
    return [...this.pieces].reduce((acc, entry) => {
      if (entry[1].color === color)
        acc.push(entry);
      return acc;
    }, [] as [Coords, TPiece][]);
  }

  public getNonKingPieces() {
    return [...this.pieces].reduce((acc, entry) => {
      if (!entry[1].isKing())
        acc.get(entry[1].color)!.push(entry);
      return acc;
    }, new Map<Color, [Coords, TPiece][]>([
      [Color.WHITE, []],
      [Color.BLACK, []]
    ]));
  }

  public *attackedCoords(srcCoords: Coords) {
    const srcPiece = this.pieces.get(srcCoords)!;
    const { x: xOffsets, y: yOffsets } = srcPiece.offsets;

    if (srcPiece.isShortRange()) {
      for (let i = 0; i < xOffsets.length; i++) {
        const destCoords = srcCoords.peer(xOffsets[i], yOffsets[i]);
        if (destCoords) yield destCoords;
      }
      return;
    }

    for (let i = 0; i < xOffsets.length; i++) {
      for (const destCoords of srcCoords.peers(xOffsets[i], yOffsets[i])) {
        yield destCoords;
        if (this.has(destCoords)) break;
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

  // ===== ===== ===== ===== =====
  // BOOLEAN METHODS
  // ===== ===== ===== ===== =====

  public isColorInCheck(color: Color) {
    const kingCoords = this.getKingCoords(color);

    for (const [srcCoords, srcPiece] of this.pieces)
      if (srcPiece.color === color.opposite)
        for (const destCoords of this.attackedCoords(srcCoords))
          if (destCoords === kingCoords)
            return true;

    return false;
  }

  // ===== ===== ===== ===== =====
  // MISC
  // ===== ===== ===== ===== =====

  public clone() {
    const clone = new (this.constructor as typeof BaseBoard)();
    this.pieces.forEach((piece, index) => clone.set(index, piece));
    return clone;
  }

  public toString() {
    return Array
      .from({ length: this.height }, (_, x) => {
        let row = "";
        for (let y = 0; y < this.width; y++)
          row += this.at(x, y)?.initial ?? "0";
        return row;
      })
      .join("/")
      .replace(/0+/g, (zeros) => String(zeros.length));
  }

  public toArray() {
    return Array.from({ length: this.height }, (_, x) => {
      return Array.from({ length: this.width }, (_, y) => {
        return this.at(x, y)?.toObject() ?? null;
      });
    });
  }
}