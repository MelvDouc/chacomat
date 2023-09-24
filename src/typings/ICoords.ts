export default interface ICoords {
  readonly x: number;
  readonly y: number;
  get fileNotation(): string;
  get rankNotation(): string;
  get notation(): string;
  isLightSquare(): boolean;
  peer(xOffset: number, yOffset: number): ICoords | null;
  peers(xOffset: number, yOffset: number): Generator<ICoords>;
}