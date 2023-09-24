import Color from "@/base/Color.ts";
import Coords from "@/base/Coords.ts";
import { IBoard, IColor, ICoords, IPiece, PieceOffsets } from "@/typings/types.ts";
import ShatranjPiece from "@/variants/shatranj/ShatranjPiece.ts";

export default class ShatranjBoard implements IBoard {
  public static getCoordsFromNotation(notation: string) {
    return Coords.fromNotation(notation);
  }

  protected readonly pieces = new Map<ICoords, IPiece>();
  protected readonly kingCoords = new Map<IColor, ICoords>();
  public readonly height: number = 8;
  public readonly width: number = 8;

  public addPiecesFromString(boardStr: string) {
    boardStr
      .replace(/\d+/g, (n) => "0".repeat(+n))
      .split("/")
      .forEach((row, x) => {
        row
          .split("")
          .forEach((initial, y) => {
            if (initial !== "0")
              this.set(this.coords(x, y), this.pieceFromInitial(initial)!);
          });
      });
    return this;
  }

  // ===== ===== ===== ===== =====
  // BOARD ACCESSORS
  // ===== ===== ===== ===== =====

  // overridden by 10x8 boards
  public coords(x: number, y: number) {
    return Coords.get(x, y);
  }

  public has(coords: ICoords) {
    return this.pieces.has(coords);
  }

  public get(coords: ICoords) {
    return this.pieces.get(coords) ?? null;
  }

  public set(coords: ICoords, piece: IPiece) {
    this.pieces.set(coords, piece);
    if (piece.isKing()) this.kingCoords.set(piece.color, coords);
    return this;
  }

  public delete(coords: ICoords) {
    this.pieces.delete(coords);
    return this;
  }

  public at(x: number, y: number) {
    return this.get(this.coords(x, y));
  }

  public pieceCount() {
    return this.pieces.size;
  }

  public pieceFromInitial(initial: string) {
    return ShatranjPiece.fromInitial(initial);
  }

  // ===== ===== ===== ===== =====
  // GETTERS
  // ===== ===== ===== ===== =====

  public getKingCoords(color: IColor) {
    return this.kingCoords.get(color)!;
  }

  public piecesOfColor(color: IColor) {
    return [...this.pieces].reduce((acc, entry) => {
      if (entry[1].color === color)
        acc.push(entry);
      return acc;
    }, [] as [ICoords, IPiece][]);
  }

  public nonKingPieces() {
    return [...this.pieces].reduce((acc, entry) => {
      if (!entry[1].isKing())
        acc.get(entry[1].color)!.push(entry);
      return acc;
    }, new Map<IColor, [ICoords, IPiece][]>([
      [Color.WHITE, []],
      [Color.BLACK, []]
    ]));
  }

  public *attackedCoords(srcCoords: ICoords) {
    const srcPiece = this.pieces.get(srcCoords)!;

    if (srcPiece.isShortRange()) {
      yield* this.shortRangeAttackedCoords(srcCoords, srcPiece.offsets);
      return;
    }

    yield* this.longRangeAttackedCoords(srcCoords, srcPiece.offsets);
  }

  public getAttackedCoordsSet(color: IColor) {
    const set = new Set<ICoords>();

    for (const [srcCoords] of this.piecesOfColor(color))
      for (const destCoords of this.attackedCoords(srcCoords))
        set.add(destCoords);

    return set;
  }

  // ===== ===== ===== ===== =====
  // BOOLEAN METHODS
  // ===== ===== ===== ===== =====

  public isColorInCheck(color: IColor) {
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
    const clone = new (this.constructor as typeof ShatranjBoard)() as this;
    this.pieces.forEach((piece, coords) => clone.set(coords, piece));
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
        return this.at(x, y)?.toJSON() ?? null;
      });
    });
  }

  // ===== ===== ===== ===== =====
  // PROTECTED
  // ===== ===== ===== ===== =====

  protected *shortRangeAttackedCoords(srcCoords: ICoords, { x: xOffsets, y: yOffsets }: PieceOffsets) {
    for (let i = 0; i < xOffsets.length; i++) {
      const destCoords = srcCoords.peer(xOffsets[i], yOffsets[i]);
      if (destCoords) yield destCoords;
    }
  }

  protected *longRangeAttackedCoords(srcCoords: ICoords, { x: xOffsets, y: yOffsets }: PieceOffsets) {
    for (let i = 0; i < xOffsets.length; i++) {
      for (const destCoords of srcCoords.peers(xOffsets[i], yOffsets[i])) {
        yield destCoords;
        if (this.has(destCoords)) break;
      }
    }
  }
}