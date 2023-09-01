import Color from "@constants/Color.js";
import Piece from "@constants/Piece.js";
import Coords from "@game/Coords.js";
import Position from "@game/Position.js";
import type Move from "@moves/Move.js";
import PawnMove from "@moves/PawnMove.js";
import { getMoveSegments, stringifyMetaData } from "@pgn/game-to-pgn.js";
import parsePgn from "@pgn/parse-pgn.js";
import { GameMetaData, PromotionType, Result } from "@types.js";

export default class ChessGame {
  public static readonly BOARD_SIZE = 8;

  public static readonly Result = {
    WHITE_WIN: "1-0",
    BLACK_WIN: "0-1",
    DRAW: "1/2-1/2",
    DOUBLE_LOSS: "0-0",
    NONE: "*"
  } as const;

  public readonly metaData: Partial<GameMetaData> = {};
  public currentPosition: Position;
  public result: Result;

  public constructor({ pgn, metaData }: {
    pgn?: string;
    metaData?: Partial<GameMetaData>;
  } = {}) {
    if (metaData) Object.assign(this.metaData, metaData);
    this.currentPosition = Position.fromFen(this.metaData.FEN ?? Position.START_FEN);
    let result: Result | null = null;

    if (pgn) {
      const { metaData, enterMoves, result: r } = parsePgn(pgn.trim());
      Object.assign(this.metaData, metaData);
      enterMoves(this);
      result = r;
    }

    if (result === null)
      this.updateResult();
  }

  public get firstPosition() {
    let pos = this.currentPosition;
    while (pos.prev) pos = pos.prev;
    return pos;
  }

  protected updateResult(): void {
    switch (this.currentPosition.status) {
      case Position.Status.CHECKMATE:
        this.result = (this.currentPosition.activeColor === Color.WHITE)
          ? ChessGame.Result.BLACK_WIN
          : ChessGame.Result.WHITE_WIN;
        break;
      case Position.Status.STALEMATE:
      case Position.Status.FIFTY_MOVE_RULE:
      case Position.Status.INSUFFICIENT_MATERIAL:
      case Position.Status.TRIPLE_REPETITION:
        this.result = ChessGame.Result.DRAW;
        break;
      default:
        this.result = ChessGame.Result.NONE;
    }
  }

  public goToStart(): void {
    this.currentPosition = this.firstPosition;
  }

  public goBack(): void {
    const { prev } = this.currentPosition;
    if (prev) this.currentPosition = prev;
  }

  public playMove(move: Move, promotionType?: PromotionType): this {
    const pos = this.currentPosition;
    const board = pos.board.clone();
    const castlingRights = pos.castlingRights.clone();
    const srcPiece = board.get(move.srcCoords) as Piece;
    const destPiece = move.getCapturedPiece(board);
    const enPassantCoords = move instanceof PawnMove && move.isDouble()
      ? Coords.get((move.srcCoords.x + move.destCoords.x) / 2, move.destCoords.y)
      : null;

    if (srcPiece.isKing())
      castlingRights.clear(pos.activeColor);

    if (srcPiece.isRook() && move.srcCoords.x === pos.activeColor.initialPieceRank)
      castlingRights.addFile(pos.activeColor, move.srcCoords.y);

    if (destPiece?.isRook() && move.destCoords.x === pos.activeColor.initialPieceRank)
      castlingRights.addFile(pos.activeColor.opposite, move.destCoords.y);

    move.play(board);

    if (move instanceof PawnMove && move.isPromotion()) {
      promotionType ??= "Q";
      board.set(move.destCoords, Piece.fromInitial(srcPiece.color === Color.WHITE ? promotionType : promotionType.toLowerCase())!);
    }

    const nextPos = new Position(
      board,
      pos.activeColor.opposite,
      castlingRights,
      enPassantCoords,
      (destPiece || srcPiece.isPawn()) ? 0 : (pos.halfMoveClock + 1),
      pos.fullMoveNumber + Number(pos.activeColor === Color.BLACK)
    );
    nextPos.prev = pos;
    pos.next.push({ move, position: nextPos });
    this.currentPosition = nextPos;
    this.updateResult();
    return this;
  }

  public playMoveWithNotation(notation: string, promotionType?: PromotionType): this {
    const move = this.currentPosition.legalMoves.find((move) => {
      return move.getComputerNotation() === notation;
    });

    if (!move)
      throw new Error(`Illegal move: "${notation}".`);

    return this.playMove(move, promotionType);
  }

  public toString() {
    return `${stringifyMetaData(this.metaData)}\n\n${getMoveSegments(this.firstPosition).join(" ")} ${this.result}`;
  }
}