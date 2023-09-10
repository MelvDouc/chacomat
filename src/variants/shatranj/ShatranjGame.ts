import Color from "@/constants/Color.ts";
import GameResults from "@/constants/GameResults.ts";
import ShatranjPositionStatuses from "@/constants/PositionStatuses.ts";
import { GameMetaData, GameResult, Move } from "@/types/main-types.ts";
import ShatranjPosition from "@/variants/shatranj/ShatranjPosition.ts";
import PawnMove from "@/variants/shatranj/moves/PawnMove.ts";

export default class ShatranjGame<TPosition extends ShatranjPosition = ShatranjPosition> {
  protected static readonly Position: typeof ShatranjPosition = ShatranjPosition;

  protected static getInitialPosition(fen?: string) {
    return fen
      ? this.Position.fromFen(fen)
      : this.Position.new();
  }

  public readonly metaData: Pick<GameMetaData, "Result"> & Partial<Omit<GameMetaData, "Result">> & { [key: string]: any; };
  public currentPosition: TPosition;

  public constructor({ metaData }: {
    metaData?: Partial<GameMetaData> & { [key: string]: any; };
  } = {}) {
    metaData ??= {};
    this.metaData = {
      ...metaData,
      Result: metaData.Result ?? GameResults.NONE
    };
    this.currentPosition = (metaData.FEN
      ? ShatranjPosition.fromFen(metaData.FEN)
      : ShatranjPosition.new()) as TPosition;
  }

  public get firstPosition(): TPosition {
    let pos = this.currentPosition;
    while (pos.prev) pos = pos.prev as TPosition;
    return pos;
  }

  public getResult(): GameResult {
    switch (this.currentPosition.status) {
      case ShatranjPositionStatuses.CHECKMATE:
        return (this.currentPosition.activeColor === Color.WHITE)
          ? GameResults.BLACK_WIN
          : GameResults.WHITE_WIN;
      case ShatranjPositionStatuses.STALEMATE:
      case ShatranjPositionStatuses.INSUFFICIENT_MATERIAL:
        return GameResults.DRAW;
      default:
        return GameResults.NONE;
    }
  }

  public goToStart() {
    this.currentPosition = this.firstPosition;
  }

  public goBack() {
    const { prev } = this.currentPosition;
    if (prev) this.currentPosition = prev as TPosition;
  }

  public playMove(move: Move) {
    const pos = this.currentPosition;
    const board = pos.board.clone();
    const srcPiece = board.getByCoords(move.srcCoords)!;

    if (move instanceof PawnMove && move.isPromotion(board))
      move.promotedPiece = (board.constructor as typeof ShatranjPosition["Board"])
        .PieceConstructor
        .fromInitial(srcPiece.color === Color.WHITE ? "Q" : "q")!;

    move.try(board);

    const nextPos = new (this.constructor as typeof ShatranjGame).Position({
      board,
      activeColor: pos.activeColor.opposite,
      fullMoveNumber: pos.fullMoveNumber + Number(pos.activeColor === Color.BLACK)
    });
    nextPos.prev = pos;
    pos.next.push([move, nextPos]);
    this.currentPosition = nextPos as TPosition;
    return this;
  }

  /**
   * @param notation A computer notation like "e2e4" or "a2a1Q".
   * @returns This same game.
   */
  public playMoveWithNotation(notation: string) {
    const move = this.currentPosition.legalMoves.find((move) => {
      return move.getComputerNotation() === notation;
    });

    if (!move)
      throw new Error(`Illegal move: "${notation}".`);

    return this.playMove(move);
  }
}