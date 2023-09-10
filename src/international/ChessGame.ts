import Color from "@/constants/Color.ts";
import GameResults from "@/constants/GameResults.ts";
import PositionStatuses from "@/constants/PositionStatuses.ts";
import Position from "@/international/Position.ts";
import { stringifyPos } from "@/pgn/game-to-pgn.ts";
import parsePgn from "@/pgn/parse-pgn.ts";
import { GameMetaData, GameResult, Move } from "@/types/main-types.ts";
import ShatranjGame from "@/variants/shatranj/ShatranjGame.ts";
import PawnMove from "@/variants/shatranj/moves/PawnMove.ts";

export default class ChessGame extends ShatranjGame<Position> {
  protected static override readonly Position: typeof Position = Position;

  public constructor({ pgn, metaData }: {
    pgn?: string;
    metaData?: Partial<GameMetaData> & { [key: string]: any; };
  } = {}) {
    super({ metaData });
    this.currentPosition = (this.constructor as typeof ChessGame).getInitialPosition(metaData?.FEN) as Position;
    if (pgn) this.enterPgn(pgn);
  }

  public override getResult(): GameResult {
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

  public override playMove<PType extends string>(move: Move, promotionType?: PType) {
    const pos = this.currentPosition;
    const board = pos.board.clone();
    const castlingRights = pos.castlingRights.clone();
    const isPawnMove = move instanceof PawnMove;
    const srcPiece = board.getByCoords(move.srcCoords)!;
    const destPiece = isPawnMove ? move.getCapturedPiece(board) : board.getByCoords(move.destCoords);
    const enPassantCoords = isPawnMove && move.isDouble()
      ? move.srcCoords.getPeer(pos.activeColor.direction, 0)
      : null;

    if (isPawnMove && move.isPromotion(board)) {
      promotionType ??= "Q" as PType;
      move.promotedPiece = (board.constructor as typeof Position["Board"])
        .PieceConstructor
        .fromInitial(srcPiece.color === Color.WHITE ? promotionType : (promotionType ?? "Q").toLowerCase())!;
    }

    if (srcPiece.isKing())
      castlingRights.clear(pos.activeColor);

    if (srcPiece.isRook() && move.srcCoords.x === pos.activeColor.getPieceRank(board.height))
      castlingRights.remove(pos.activeColor, move.srcCoords.y);

    if (destPiece?.isRook() && move.destCoords.x === pos.activeColor.opposite.getPieceRank(board.height))
      castlingRights.remove(pos.activeColor.opposite, move.destCoords.y);

    move.try(board);

    const nextPos = new (this.constructor as typeof ChessGame).Position({
      board,
      activeColor: pos.activeColor.opposite,
      castlingRights,
      enPassantCoords,
      halfMoveClock: (destPiece || isPawnMove) ? 0 : (pos.halfMoveClock + 1),
      fullMoveNumber: pos.fullMoveNumber + Number(pos.activeColor === Color.BLACK)
    });
    nextPos.prev = pos;
    pos.next.push([move, nextPos]);
    this.currentPosition = nextPos;
    return this;
  }

  public override playMoveWithNotation(notation: string) {
    const move = this.currentPosition.legalMoves.find((move) => {
      return move.getComputerNotation() === notation;
    });

    if (!move)
      throw new Error(`Illegal move: "${notation}".`);

    return this.playMove(move, notation[4]);
  }

  public enterPgn(pgn: string) {
    const { metaData, enterMoves } = parsePgn(pgn.trim());
    Object.assign(this.metaData, metaData);
    enterMoves(this);
  }

  public override toString() {
    const { firstPosition } = this;
    const metaData = Object.entries({ ...this.metaData, FEN: firstPosition.toString() })
      .map(([key, value]) => `[${key} "${value}"]`)
      .join("\n");

    return `${metaData}\n\n${stringifyPos(firstPosition) + this.metaData.Result}`;
  }
}