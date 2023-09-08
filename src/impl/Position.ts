import PositionStatuses from "@/constants/PositionStatuses.ts";
import Board from "@/impl/Board.ts";
import CastlingRights from "@/impl/CastlingRights.ts";
import Color from "@/impl/Color.ts";
import CastlingMove from "@/impl/moves/CastlingMove.ts";
import PawnMove from "@/impl/moves/PawnMove.ts";
import PieceMove from "@/impl/moves/PieceMove.ts";
import { Coordinates, JsonTypes, Move, PositionStatus } from "@/types/types.ts";

export default class Position {
  protected static readonly Board: typeof Board = Board;
  protected static readonly CastlingRights: typeof CastlingRights = CastlingRights;

  public static isValidFen(fen: string) {
    return /^[pnbrqkPNBRQK1-8]+(\/[pnbrqkPNBRQK1-8]+){7} (w|b) ([KQkq]{1,4}|-) ([a-h][36]|-) \d+ \d+$/.test(fen);
  }

  public static fromFen(fen: string) {
    if (!this.isValidFen(fen))
      throw new Error(`Invalid FEN string: "${fen}".`);

    const [pieceStr, clr, castling, enPassant, halfMoveClock, fullMoveNumber] = fen.split(" ");

    return new this(
      this.Board.fromString(pieceStr),
      Color.fromAbbreviation(clr),
      this.CastlingRights.fromString(castling),
      this.Board.Coords.fromNotation(enPassant),
      Number(halfMoveClock),
      Number(fullMoveNumber)
    );
  }

  public static new() {
    return this.fromFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  }

  public readonly legalMoves: Move[];
  public prev: Position | null = null;
  public next: [Move, Position][] = [];
  protected _repCount = 1;

  public constructor(
    public readonly board: Board,
    public readonly activeColor: Color,
    public readonly castlingRights: CastlingRights,
    public readonly enPassantCoords: Coordinates | null,
    public readonly halfMoveClock: number,
    public readonly fullMoveNumber: number
  ) {
    this.legalMoves = this.computeLegalMoves();
    Object.freeze(this.legalMoves);
  }

  // ===== ===== ===== ===== =====
  // GETTERS
  // ===== ===== ===== ===== =====

  public get status(): PositionStatus {
    if (this.legalMoves.length === 0)
      return this.isCheck() ? PositionStatuses.CHECKMATE : PositionStatuses.STALEMATE;
    if (this.halfMoveClock >= 50)
      return PositionStatuses.FIFTY_MOVE_RULE;
    if (this.isTripleRepetition())
      return PositionStatuses.TRIPLE_REPETITION;
    if (this.isInsufficientMaterial())
      return PositionStatuses.INSUFFICIENT_MATERIAL;
    return PositionStatuses.ON_GOING;
  }

  public get legalMovesAsAlgebraicNotation() {
    return this.legalMoves.map((move) => move.getAlgebraicNotation(this.board, this.legalMoves));
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

  protected *forwardPawnCoords(color: Color, srcCoords: Coordinates) {
    const destCoords1 = srcCoords.getPeer(color.direction, 0);

    if (destCoords1 && !this.board.hasCoords(destCoords1)) {
      yield destCoords1;

      if (srcCoords.x === color.getPawnRank(this.board.height)) {
        const destCoords2 = destCoords1.getPeer(color.direction, 0);
        if (destCoords2 && !this.board.hasCoords(destCoords2))
          yield destCoords2;
      }
    }
  }

  protected *pseudoLegalPawnMoves(srcCoords: Coordinates) {
    for (const destCoords of this.forwardPawnCoords(this.activeColor, srcCoords))
      yield new PawnMove(srcCoords, destCoords);

    for (const destCoords of this.board.attackedCoords(srcCoords))
      if (this.board.getByCoords(destCoords)?.color === this.activeColor.opposite || this.enPassantCoords === destCoords)
        yield new PawnMove(srcCoords, destCoords);
  }

  protected *pseudoLegalMoves() {
    for (const [srcCoords, srcPiece] of this.board.getPiecesOfColor(this.activeColor)) {
      if (srcPiece.isPawn()) {
        yield* this.pseudoLegalPawnMoves(srcCoords);
        continue;
      }

      for (const destCoords of this.board.attackedCoords(srcCoords))
        if (this.board.getByCoords(destCoords)?.color !== this.activeColor)
          yield new PieceMove(srcCoords, destCoords);
    }
  }

  protected computeLegalMoves() {
    const legalMoves: Move[] = [];

    for (const move of this.pseudoLegalMoves()) {
      const undo = move.try(this.board);
      if (!this.isCheck()) legalMoves.push(move);
      undo();
    }

    legalMoves.push(...this.castlingMoves());
    return legalMoves;
  }

  // ===== ===== ===== ===== =====
  // STATUS
  // ===== ===== ===== ===== =====

  public isCheck() {
    const kingCoords = this.board.getKingCoords(this.activeColor);

    for (const [srcCoords] of this.board.getPiecesOfColor(this.activeColor.opposite))
      for (const destCoords of this.board.attackedCoords(srcCoords))
        if (kingCoords === destCoords)
          return true;

    return false;
  }

  public isCheckmate() {
    return this.status === PositionStatuses.CHECKMATE;
  }

  public isStalemate() {
    return this.status === PositionStatuses.STALEMATE;
  }

  public isTripleRepetition() {
    if (this._repCount >= 3)
      return true;

    const boardStr = this.board.toString();
    let current: Position | null | undefined = this.prev?.prev;
    let count = this._repCount;

    while (current && count < 3) {
      if (current.board.toString() === boardStr)
        count += (current as Position)._repCount;
      current = current.prev?.prev;
    }

    return (this._repCount = count) >= 3;
  }

  public isInsufficientMaterial() {
    if (this.board.size > 4)
      return false;

    const whitePieces = [...this.board.getPiecesOfColor(Color.WHITE)].filter(([, piece]) => !piece.isKing());
    const blackPieces = [...this.board.getPiecesOfColor(Color.BLACK)].filter(([, piece]) => !piece.isKing());
    const [blackCoords0, blackPiece0] = blackPieces[0] ?? [];

    if (whitePieces.length === 0)
      return blackPieces.length === 0 || blackPieces.length === 1 && (blackPiece0.isKnight() || blackPiece0.isBishop());

    if (whitePieces.length === 1) {
      const [whiteCoords0, whitePiece0] = whitePieces[0];
      if (blackPieces.length === 0)
        return whitePiece0.isKnight() || whitePiece0.isBishop();
      return blackPieces.length === 1
        && whitePiece0.isBishop()
        && blackPiece0.isBishop()
        && whiteCoords0.isLightSquare() === blackCoords0.isLightSquare();
    }

    if (whitePieces.length === 2)
      return whitePieces[0][1].isKnight()
        && whitePieces[1][1].isKnight()
        && blackPieces.length === 0;

    return false;
  }

  // ===== ===== ===== ===== =====
  // MISC
  // ===== ===== ===== ===== =====

  public toString(): string {
    return [
      this.board.toString(),
      this.activeColor.abbreviation,
      this.castlingRights.toString(),
      this.enPassantCoords?.notation ?? "-",
      this.halfMoveClock,
      this.fullMoveNumber
    ].join(" ");
  }

  public toJson(): JsonTypes.Position {
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