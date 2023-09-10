import BasePiece from "@/base/BasePiece.ts";
import { coordsToIndex, indexToCoords, indexToNotation, isSafe, notationToIndex, xToRankName, yToFileName } from "@/base/CoordsUtils.ts";
import Color from "@/constants/Color.ts";
import { Coords } from "@/types.ts";

export default class BaseBoard<TPiece extends BasePiece = any> {
  protected readonly pieces = new Map<number, TPiece>();
  protected readonly kingIndices = new Map<Color, number>();
  public readonly height: number = 8;
  public readonly width: number = 8;

  public get PieceConstructor(): typeof BasePiece {
    return BasePiece;
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
              this.set(this.coordsToIndex({ x, y }), this.PieceConstructor.fromInitial(initial) as TPiece);
          });
      });
    return this;
  }

  // ===== ===== ===== ===== =====
  // CONVERSION
  // ===== ===== ===== ===== =====

  public coordsToIndex(coords: Coords) {
    return coordsToIndex(coords, this.width);
  }

  public indexToCoords(index: number): Coords {
    return indexToCoords(index, this.width);
  }

  public notationToIndex(notation: string) {
    return notationToIndex(notation, this.width);
  }

  public getRankNotation(index: number) {
    return xToRankName(Math.floor(index / this.width), this.width);
  }

  public getFileNotation(index: number) {
    return yToFileName(index % this.width);
  }

  public getNotation(index: number) {
    return indexToNotation(index, this.width);
  }

  public isCoordsSafe({ x, y }: Coords) {
    return isSafe(x, y, this.height, this.width);
  }

  // ===== ===== ===== ===== =====
  // BOARD ACCESSORS
  // ===== ===== ===== ===== =====

  public has(index: number) {
    return this.pieces.has(index);
  }

  public get(index: number) {
    return this.pieces.get(index) ?? null;
  }

  public set(index: number, piece: TPiece) {
    this.pieces.set(index, piece);
    if (piece.isKing()) this.kingIndices.set(piece.color, index);
    return this;
  }

  public delete(index: number) {
    this.pieces.delete(index);
    return this;
  }

  public getPieceCount() {
    return this.pieces.size;
  }

  // ===== ===== ===== ===== =====
  // GETTERS
  // ===== ===== ===== ===== =====

  public getKingIndex(color: Color) {
    return this.kingIndices.get(color)!;
  }

  public getPiecesOfColor(color: Color) {
    return [...this.pieces].reduce((acc, entry) => {
      if (entry[1].color === color)
        acc.push(entry);
      return acc;
    }, [] as [number, TPiece][]);
  }

  public getNonKingPieces() {
    return [...this.pieces].reduce((acc, entry) => {
      if (!entry[1].isKing())
        acc.get(entry[1].color)!.push(entry);
      return acc;
    }, new Map<Color, [number, TPiece][]>([
      [Color.WHITE, []],
      [Color.BLACK, []]
    ]));
  }

  public *attackedIndices(srcIndex: number) {
    const srcPiece = this.pieces.get(srcIndex)!;
    const { x: xOffsets, y: yOffsets } = srcPiece.offsets;
    const srcCoords = this.indexToCoords(srcIndex);

    if (srcPiece.isShortRange()) {
      for (let i = 0; i < xOffsets.length; i++) {
        const destCoords = { x: srcCoords.x + xOffsets[i], y: srcCoords.y + yOffsets[i] };

        if (this.isCoordsSafe(destCoords))
          yield this.coordsToIndex(destCoords);
      }
      return;
    }

    for (let i = 0; i < xOffsets.length; i++) {
      const destCoords = { x: srcCoords.x + xOffsets[i], y: srcCoords.y + yOffsets[i] };

      while (this.isCoordsSafe(destCoords)) {
        const destIndex = this.coordsToIndex(destCoords);
        yield destIndex;
        if (this.has(destIndex)) break;
        destCoords.x += xOffsets[i];
        destCoords.y += yOffsets[i];
      }
    }
  }

  public getAttackedIndexSet(color: Color) {
    const set = new Set<number>();

    for (const [srcIndex] of this.getPiecesOfColor(color))
      for (const destIndex of this.attackedIndices(srcIndex))
        set.add(destIndex);

    return set;
  }

  // ===== ===== ===== ===== =====
  // BOOLEAN METHODS
  // ===== ===== ===== ===== =====

  public isLightSquare(index: number) {
    const { x, y } = this.indexToCoords(index);
    return x % 2 === y % 2;
  }

  public isColorInCheck(color: Color) {
    const kingIndex = this.getKingIndex(color);

    for (const [srcIndex, srcPiece] of this.pieces)
      if (srcPiece.color === color.opposite)
        for (const destIndex of this.attackedIndices(srcIndex))
          if (destIndex === kingIndex)
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
          row += this.get(this.coordsToIndex({ x, y }))?.initial ?? "0";
        return row;
      })
      .join("/")
      .replace(/0+/g, (zeros) => String(zeros.length));
  }

  public toArray() {
    return Array.from({ length: this.height }, (_, x) => {
      return Array.from({ length: this.width }, (_, y) => {
        return this.get(this.coordsToIndex({ x, y }))?.toObject() ?? null;
      });
    });
  }
}