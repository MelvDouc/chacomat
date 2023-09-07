import Color from "@/constants/Color.ts";
import type Coords from "@/constants/Coords.ts";
import PositionStatuses from "@/constants/PositionStatuses.ts";
import Board from "@/game/Board.ts";
import CastlingRights from "@/game/CastlingRights.ts";
import CastlingMove from "@/game/moves/CastlingMove.ts";
import type Move from "@/game/moves/Move.ts";
import PawnMove from "@/game/moves/PawnMove.ts";
import PieceMove from "@/game/moves/PieceMove.ts";
import { Status } from "@/types.ts";

export default class Position {
  protected static readonly Board: typeof Board = Board;
  protected static readonly CastlingRights: typeof CastlingRights = CastlingRights;

  public static isValidFen(fen: string): boolean {
    return /^[pnbrqkPNBRQK1-8]+(\/[pnbrqkPNBRQK1-8]+){7} (w|b) ([KQkq]{1,4}|-) ([a-h][36]|-) \d+ \d+$/.test(fen);
  }

  public static fromFen(fen: string): Position {
    if (!this.isValidFen(fen))
      throw new Error(`Invalid FEN string: "${fen}".`);

    const [pieceStr, clr, castling, enPassant, halfMoveClock, fullMoveNumber] = fen.split(" ");

    return new this(
      this.Board.fromString(pieceStr),
      Color.fromAbbreviation(clr),
      this.CastlingRights.fromString(castling),
      this.Board.prototype.Coords.fromNotation(enPassant),
      Number(halfMoveClock),
      Number(fullMoveNumber)
    );
  }

  public static new() {
    return this.fromFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  }

  public readonly legalMoves: Move[];
  public prev: Position | null = null;
  public next = new Map<Move, Position>();

  public constructor(
    public readonly board: Board,
    public readonly activeColor: Color,
    public readonly castlingRights: CastlingRights,
    public readonly enPassantCoords: Coords | null,
    public readonly halfMoveClock: number,
    public readonly fullMoveNumber: number
  ) {
    this.legalMoves = this.computeLegalMoves();
    Object.freeze(this.legalMoves);
  }

  // ===== ===== ===== ===== =====
  // GETTERS
  // ===== ===== ===== ===== =====

  public get status(): Status {
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

  public get legalMovesAsAlgebraicNotation(): string[] {
    return this.legalMoves.map((move) => move.getAlgebraicNotation(this.board, this.legalMoves));
  }

  // ===== ===== ===== ===== =====
  // MOVES
  // ===== ===== ===== ===== =====

  protected *castlingMoves(): Generator<Move> {
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

  protected *pseudoLegalPawnMoves(srcCoords: Coords) {
    for (const destCoords of this.board.forwardPawnCoords(this.activeColor, srcCoords))
      yield new PawnMove(srcCoords, destCoords);

    for (const destCoords of this.board.attackedCoords(srcCoords))
      if (this.board.get(destCoords)?.color === this.activeColor.opposite || this.enPassantCoords === destCoords)
        yield new PawnMove(srcCoords, destCoords);
  }

  protected *pseudoLegalMoves() {
    for (const [srcCoords, srcPiece] of this.board.getPiecesOfColor(this.activeColor)) {
      if (srcPiece.isPawn()) {
        yield* this.pseudoLegalPawnMoves(srcCoords);
        continue;
      }

      for (const destCoords of this.board.attackedCoords(srcCoords))
        if (this.board.get(destCoords)?.color !== this.activeColor)
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

  public isCheck(): boolean {
    const kingCoords = this.board.getKingCoords(this.activeColor);

    for (const [srcCoords] of this.board.getPiecesOfColor(this.activeColor.opposite))
      for (const destCoords of this.board.attackedCoords(srcCoords))
        if (kingCoords === destCoords)
          return true;

    return false;
  }

  public isCheckmate(): boolean {
    return this.isCheck() && !this.legalMoves.length;
  }

  public isStalemate(): boolean {
    return !this.isCheck() && !this.legalMoves.length;
  }

  public isTripleRepetition(): boolean {
    const boardStr = this.board.toString();
    let current: Position | null | undefined = this.prev?.prev;
    let count = 1;

    while (current && count < 3) {
      if (current.board.toString() === boardStr)
        count++;
      current = current.prev?.prev;
    }

    return count === 3;
  }

  public isInsufficientMaterial(): boolean {
    if (this.board.size > 4)
      return false;

    const whitePieces = [...this.board.getPiecesOfColor(Color.WHITE)].filter(([, piece]) => !piece.isKing());
    const blackPieces = [...this.board.getPiecesOfColor(Color.BLACK)].filter(([, piece]) => !piece.isKing());
    const [blackCoords0, blackPiece0] = blackPieces[0] ?? [];

    if (whitePieces.length === 0)
      return blackPieces.length === 0 || blackPieces.length === 1 && blackPiece0.isWorth3();

    if (whitePieces.length === 1) {
      const [whiteCoords0, whitePiece0] = whitePieces[0];
      if (blackPieces.length === 0)
        return whitePiece0.isWorth3();
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
}