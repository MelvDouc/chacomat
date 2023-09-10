import Color from "@/constants/Color.ts";
import PositionStatuses from "@/constants/PositionStatuses.ts";
import Board from "@/international/Board.ts";
import CastlingRights from "@/international/CastlingRights.ts";
import CastlingMove from "@/international/moves/CastlingMove.ts";
import { Coordinates, Json, Move, PositionStatus } from "@/types/main-types.ts";
import ShatranjPosition from "@/variants/shatranj/ShatranjPosition.ts";

export default class Position extends ShatranjPosition {
  protected static override readonly Board: typeof Board = Board;
  protected static readonly CastlingRights: typeof CastlingRights = CastlingRights;

  public static override isValidFen(fen: string) {
    return /^[pnbrqkPNBRQK1-8]+(\/[pnbrqkPNBRQK1-8]+){7} (w|b) ([KQkq]{1,4}|-) ([a-h][36]|-) \d+ \d+$/.test(fen);
  }

  public static override fromFen(fen: string) {
    if (!this.isValidFen(fen))
      throw new Error(`Invalid FEN string: "${fen}".`);

    const [pieceStr, clr, castling, enPassant, halfMoveClock, fullMoveNumber] = fen.split(" ");

    return new this({
      board: this.Board.fromString(pieceStr) as Board,
      activeColor: Color.fromAbbreviation(clr),
      castlingRights: this.CastlingRights.fromString(castling),
      enPassantCoords: this.Board.Coords.fromNotation(enPassant),
      halfMoveClock: Number(halfMoveClock),
      fullMoveNumber: Number(fullMoveNumber)
    });
  }

  public static override new() {
    return this.fromFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  }

  declare public readonly board: Board;
  declare public prev: Position | null;
  declare public readonly next: [Move, Position][];
  public readonly castlingRights: CastlingRights;
  public readonly enPassantCoords: Coordinates | null;
  public readonly halfMoveClock: number;
  protected _repCount = 1;

  public constructor({ board, activeColor, castlingRights, enPassantCoords, halfMoveClock, fullMoveNumber }: {
    board: Board,
    activeColor: Color,
    castlingRights: CastlingRights,
    enPassantCoords: Coordinates | null,
    halfMoveClock: number,
    fullMoveNumber: number;
  }) {
    super({ board, activeColor, fullMoveNumber });
    this.castlingRights = castlingRights;
    this.enPassantCoords = enPassantCoords;
    this.halfMoveClock = halfMoveClock;
  }

  // ===== ===== ===== ===== =====
  // GETTERS
  // ===== ===== ===== ===== =====

  public override get status(): PositionStatus {
    if (this.legalMoves.length === 0)
      return this.isCheck() ? PositionStatuses.CHECKMATE : PositionStatuses.STALEMATE;
    if (this.halfMoveClock >= 50)
      return PositionStatuses.FIFTY_MOVE_RULE;
    if (this.isTripleRepetition())
      return PositionStatuses.TRIPLE_REPETITION;
    if (this.isInsufficientMaterial())
      return PositionStatuses.INSUFFICIENT_MATERIAL;
    return PositionStatuses.ONGOING;
  }

  // ===== ===== ===== ===== =====
  // MOVES
  // ===== ===== ===== ===== =====

  protected *castlingMoves() {
    const attackedCoordsSet = this.board.getAttackedCoordsSet(this.activeColor.opposite);
    const kingCoords = this.board.getKingCoords(this.activeColor);
    if (attackedCoordsSet.has(kingCoords)) return;

    for (const rookSrcY of this.castlingRights.files(this.activeColor)) {
      if (this.board.canCastle(rookSrcY, this.activeColor, attackedCoordsSet))
        yield new CastlingMove(
          kingCoords,
          kingCoords.getPeer(0, Math.sign(rookSrcY - kingCoords.y) * this.board.castlingMultiplier)!,
          rookSrcY
        );
    }
  }

  protected override *forwardPawnCoords(srcCoords: Coordinates) {
    const [destCoords1] = [...super.forwardPawnCoords(srcCoords)];

    if (destCoords1) {
      yield destCoords1;

      if (srcCoords.x === this.activeColor.getPawnRank(this.board.height)) {
        const destCoords2 = destCoords1.getPeer(this.activeColor.direction, 0);
        if (destCoords2 && !this.board.hasCoords(destCoords2))
          yield destCoords2;
      }
    }
  }

  protected override *pawnCaptureCoords(srcCoords: Coordinates) {
    for (const destCoords of this.board.attackedCoords(srcCoords))
      if (this.board.getByCoords(destCoords)?.color === this.activeColor.opposite || destCoords === this.enPassantCoords)
        yield destCoords;
  }

  protected override computeLegalMoves() {
    return super.computeLegalMoves().concat(...this.castlingMoves());
  }

  // ===== ===== ===== ===== =====
  // STATUS
  // ===== ===== ===== ===== =====

  public isTripleRepetition() {
    if (this._repCount >= 3)
      return true;

    const boardStr = this.board.toString();
    let current: Position | null | undefined = this.prev?.prev;

    while (current && this._repCount < 3) {
      if (current.board.toString() === boardStr)
        this._repCount += current._repCount;
      current = current.prev?.prev;
    }

    return this._repCount >= 3;
  }

  public override isInsufficientMaterial() {
    if (this.board.size > 4)
      return false;

    const nonKingPieces = this.board.getNonKingPieces();
    const activePieces = nonKingPieces.get(this.activeColor)!;
    const inactivePieces = nonKingPieces.get(this.activeColor.opposite)!;
    const [inactiveCoords0, inactivePiece0] = inactivePieces[0] ?? [];

    if (activePieces.length === 0)
      return inactivePieces.length === 0 || inactivePieces.length === 1 && (inactivePiece0.isKnight() || inactivePiece0.isBishop());

    if (activePieces.length === 1) {
      const [whiteCoords0, whitePiece0] = activePieces[0];
      if (inactivePieces.length === 0)
        return whitePiece0.isKnight() || whitePiece0.isBishop();
      return inactivePieces.length === 1
        && whitePiece0.isBishop()
        && inactivePiece0.isBishop()
        && whiteCoords0.isLightSquare() === inactiveCoords0.isLightSquare();
    }

    return false;
  }

  // ===== ===== ===== ===== =====
  // MISC
  // ===== ===== ===== ===== =====

  public override toString(): string {
    return [
      this.board.toString(),
      this.activeColor.abbreviation,
      this.castlingRights.toString(),
      this.enPassantCoords?.notation ?? "-",
      this.halfMoveClock,
      this.fullMoveNumber
    ].join(" ");
  }

  public override toJson(): Json.Position {
    return {
      activeColor: this.activeColor.abbreviation,
      castlingRights: this.castlingRights.toJson(),
      enPassantCoords: this.enPassantCoords?.toJson() ?? null,
      board: this.board.toJson(),
      legalMoves: this.legalMoves.map((move) => move.toJson(this.board, this.legalMoves)),
      next: this.next.map(([move, position]) => [
        move.toJson(this.board, this.legalMoves),
        position.toJson()
      ]),
      status: this.status,
      fen: this.toString()
    };
  }
}