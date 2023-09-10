import BaseBoard from "@/base/BaseBoard.ts";
import ShatranjPiece from "@/variants/shatranj/ShatranjPiece.ts";

export default class ShatranjBoard extends BaseBoard<ShatranjPiece> {
  public get PieceConstructor(): typeof ShatranjPiece {
    return ShatranjPiece;
  }
}