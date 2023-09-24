export default interface IColor {
  readonly abbreviation: string;
  readonly direction: number;
  readonly opposite: IColor;
  getPieceRank(boardHeight: number): number;
  getPawnRank(boardHeight: number): number;
}