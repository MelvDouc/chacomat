import GameResults from "@/constants/GameResults.ts";
import PositionStatuses from "@/constants/PositionStatuses.ts";
import Color from "@/impl/Color.ts";
import Position from "@/impl/Position.ts";
import PawnMove from "@/impl/moves/PawnMove.ts";
import { getMoveSegments } from "@/pgn/game-to-pgn.ts";
import parsePgn from "@/pgn/parse-pgn.ts";
import { GameMetaData, GameResult, Move } from "@/types/types.ts";

export default class ChessGame {
  protected static readonly Position: typeof Position = Position;

  public readonly metaData: Pick<GameMetaData, "Result"> & Partial<Omit<GameMetaData, "Result">> & { [key: string]: any; };
  public currentPosition: Position;

  public constructor({ pgn, metaData }: {
    pgn?: string;
    metaData?: Partial<GameMetaData> & { [key: string]: any; };
  } = {}) {
    metaData ??= {};
    this.metaData = {
      ...metaData,
      Result: metaData.Result ?? GameResults.NONE
    };
    const { Position } = this.constructor as typeof ChessGame;
    this.currentPosition = metaData.FEN ? Position.fromFen(metaData.FEN) : Position.new();
    if (pgn) this.enterPgn(pgn);
  }

  public get firstPosition() {
    let pos = this.currentPosition;
    while (pos.prev) pos = pos.prev;
    return pos;
  }

  public getResult(): GameResult {
    switch (this.currentPosition.status) {
      case PositionStatuses.CHECKMATE:
        return (this.currentPosition.activeColor === Color.WHITE)
          ? GameResults.BLACK_WIN
          : GameResults.WHITE_WIN;
      case PositionStatuses.STALEMATE:
      case PositionStatuses.FIFTY_MOVE_RULE:
      case PositionStatuses.INSUFFICIENT_MATERIAL:
      case PositionStatuses.TRIPLE_REPETITION:
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
    if (prev) this.currentPosition = prev;
  }

  public playMove<PType extends string>(move: Move, promotionType?: PType) {
    const pos = this.currentPosition;
    const board = pos.board.clone();
    const castlingRights = pos.castlingRights.clone();
    const isPawnMove = move instanceof PawnMove;
    const srcPiece = board.getByCoords(move.srcCoords)!;
    const destPiece = isPawnMove ? move.getCapturedPiece(board) : board.getByCoords(move.destCoords);
    const enPassantCoords = isPawnMove && move.isDouble()
      ? move.srcCoords.getPeer(pos.activeColor.direction, 0)
      : null;

    if (isPawnMove && move.isPromotion(board))
      move.promotedPiece = (board.constructor as any)
        .PieceConstructor
        .fromInitial(srcPiece.color === Color.WHITE ? promotionType : (promotionType ?? "Q").toLowerCase())!;

    if (srcPiece.isKing())
      castlingRights.clear(pos.activeColor);

    if (srcPiece.isRook() && move.srcCoords.x === pos.activeColor.getPieceRank(board.height))
      castlingRights.remove(pos.activeColor, move.srcCoords.y);

    if (destPiece?.isRook() && move.destCoords.x === pos.activeColor.opposite.getPieceRank(board.height))
      castlingRights.remove(pos.activeColor.opposite, move.destCoords.y);

    move.try(board);

    const nextPos = new (this.constructor as typeof ChessGame).Position(
      board,
      pos.activeColor.opposite,
      castlingRights,
      enPassantCoords,
      (destPiece || isPawnMove) ? 0 : (pos.halfMoveClock + 1),
      pos.fullMoveNumber + Number(pos.activeColor === Color.BLACK)
    );
    nextPos.prev = pos;
    pos.next.push([move, nextPos]);
    this.currentPosition = nextPos;
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

    return this.playMove(move, notation[5]);
  }

  public enterPgn(pgn: string) {
    const { metaData, enterMoves } = parsePgn(pgn.trim());
    Object.assign(this.metaData, metaData);
    enterMoves(this);
  }

  public toString() {
    const { firstPosition, metaData } = this;
    const metaDataStr = Object.entries(metaData)
      .map(([key, value]) => `[${key} "${value}"]`)
      .join("\n");

    return `${metaDataStr}

${getMoveSegments(firstPosition).concat(metaData.Result!).join(" ")}`;
  }
}