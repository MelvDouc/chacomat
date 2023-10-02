import Color from "@/base/Color.ts";
import { IBoard, IColor, IPiece, PieceOffsets } from "@/typings/types.ts";
import { FILES, RANKS } from "@/utils/index-utils.ts";
import ShatranjPiece from "@/variants/shatranj/ShatranjPiece.ts";

export default class ShatranjBoard implements IBoard {
  // ===== ===== ===== ===== =====
  // PUBLIC
  // ===== ===== ===== ===== =====

  protected readonly pieces = new Map<number, IPiece>();
  protected readonly kingIndices = new Map<IColor, number>();
  public readonly height: number = 8;
  public readonly width: number = 8;

  public get pieceCount() {
    return this.pieces.size;
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
              this.set(this.coordsToIndex(x, y), this.pieceFromInitial(initial)!);
          });
      });
    return this;
  }

  public at(x: number, y: number) {
    return this.get(this.coordsToIndex(x, y));
  }

  public *attackedIndices(srcIndex: number) {
    const srcPiece = this.pieces.get(srcIndex)!;
    const { x: xOffsets, y: yOffsets } = srcPiece.offsets;
    const srcCoords = this.indexToCoords(srcIndex);

    if (srcPiece.isShortRange()) {
      for (let i = 0; i < xOffsets.length; i++) {
        const x = srcCoords.x + xOffsets[i],
          y = srcCoords.y + yOffsets[i];
        if (this.isSafeCoords(x, y))
          yield this.coordsToIndex(x, y);
      }
      return;
    }

    for (let i = 0; i < xOffsets.length; i++) {
      let { x, y } = srcCoords;

      while (this.isSafeCoords(x += xOffsets[i], y += yOffsets[i])) {
        const destIndex = this.coordsToIndex(x, y);
        yield destIndex;
        if (this.has(destIndex)) break;
      }
    }
  }

  public getAttackedIndicesSet(color: IColor) {
    const set = new Set<number>();

    for (const [srcIndex, srcPiece] of this.pieces)
      if (srcPiece.color === color)
        for (const destIndex of this.attackedIndices(srcIndex))
          set.add(destIndex);

    return set;
  }

  public clone() {
    const clone = new (this.constructor as typeof ShatranjBoard)() as this;
    this.pieces.forEach((piece, coords) => clone.set(coords, piece));
    return clone;
  }

  public coordsToIndex(x: number, y: number) {
    return x * this.width + y;
  }

  public indexToCoords(index: number) {
    return {
      x: this.indexToRank(index),
      y: this.indexToFile(index)
    };
  }

  public indexToFile(index: number) {
    return index % this.width;
  }

  public indexToRank(index: number) {
    return Math.floor(index / this.width);
  }

  public indexToFileNotation(index: number) {
    return FILES[this.indexToFile(index)];
  }

  public indexToRankNotation(index: number) {
    return RANKS[this.indexToRank(index)];
  }

  public indexToNotation(index: number) {
    return this.indexToFileNotation(index) + this.indexToRankNotation(index);
  }

  public notationToIndex(notation: string) {
    return this.coordsToIndex(
      this.height - +notation.slice(1),
      FILES.indexOf(notation[0])
    );
  }

  public has(index: number) {
    return this.pieces.has(index);
  }

  public get(index: number) {
    return this.pieces.get(index) ?? null;
  }

  public delete(index: number) {
    this.pieces.delete(index);
    return this;
  }

  public set(index: number, piece: IPiece) {
    this.pieces.set(index, piece);
    if (piece.isKing()) this.kingIndices.set(piece.color, index);
    return this;
  }

  public getKingIndex(color: IColor) {
    return this.kingIndices.get(color)!;
  }

  public isColorInCheck(color: IColor) {
    const kingIndex = this.getKingIndex(color);

    for (const [srcIndex, srcPiece] of this.pieces)
      if (srcPiece.color === color.opposite)
        for (const destIndex of this.attackedIndices(srcIndex))
          if (destIndex === kingIndex)
            return true;

    return false;
  }

  public isSafeCoords(x: number, y: number) {
    return x >= 0 && x < this.height && y >= 0 && y < this.width;
  }

  public nonKingPieces() {
    return [...this.pieces].reduce((acc, entry) => {
      if (!entry[1].isKing())
        acc.get(entry[1].color)!.push(entry);
      return acc;
    }, new Map<IColor, [number, IPiece][]>([
      [Color.WHITE, []],
      [Color.BLACK, []]
    ]));
  }

  public piecesOfColor(color: IColor) {
    return [...this.pieces].filter(([, piece]) => {
      return piece.color === color;
    });
  }

  public pawnRank(color: IColor) {
    return this.pieceRank(color) + color.direction;
  }

  public pieceRank(color: IColor) {
    return (color === Color.WHITE) ? this.height - 1 : 0;
  }

  public pieceFromInitial(initial: string) {
    return ShatranjPiece.fromInitial(initial);
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
        return this.at(x, y)?.toJSON() ?? null;
      });
    });
  }

  // ===== ===== ===== ===== =====
  // PROTECTED
  // ===== ===== ===== ===== =====
}