import Color from "@/constants/Color.ts";
import PositionStatuses from "@/constants/PositionStatuses.ts";
import { Coordinates, Json, Move, PositionStatus } from "@/types/main-types.ts";
import ShatranjBoard from "@/variants/shatranj/ShatranjBoard.ts";
import PawnMove from "@/variants/shatranj/moves/PawnMove.ts";
import PieceMove from "@/variants/shatranj/moves/PieceMove.ts";

export default class ShatranjPosition {
  protected static readonly Board: typeof ShatranjBoard = ShatranjBoard;

  public static isValidFen(fen: string) {
    return /^[pnbrqkPNBRQK1-8]+(\/[pnbrqkPNBRQK1-8]+){7} (w|b) \d+$/.test(fen);
  }

  public static fromFen(fen: string) {
    if (!this.isValidFen(fen))
      throw new Error(`Invalid FEN string: "${fen}".`);

    const [pieceStr, clr, fullMoveNumber] = fen.split(" ");

    return new this({
      board: this.Board.fromString(pieceStr),
      activeColor: Color.fromAbbreviation(clr),
      fullMoveNumber: Number(fullMoveNumber)
    });
  }

  public static new() {
    return this.fromFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w 1");
  }

  public readonly board: ShatranjBoard;
  public readonly activeColor: Color;
  public readonly fullMoveNumber: number;
  protected _legalMoves!: Move[];
  public prev: ShatranjPosition | null = null;
  public next: [Move, ShatranjPosition][] = [];
  public comment?: string;

  public constructor({ board, activeColor, fullMoveNumber }: {
    board: ShatranjBoard,
    activeColor: Color,
    fullMoveNumber: number;
  }) {
    this.board = board;
    this.activeColor = activeColor;
    this.fullMoveNumber = fullMoveNumber;
  }

  // ===== ===== ===== ===== =====
  // GETTERS
  // ===== ===== ===== ===== =====

  public get legalMoves() {
    if (!this._legalMoves) {
      this._legalMoves = this.computeLegalMoves();
      Object.freeze(this._legalMoves);
    }

    return this._legalMoves;
  }

  public get status(): PositionStatus {
    if (this.legalMoves.length === 0)
      return this.isCheck()
        ? PositionStatuses.CHECKMATE
        : PositionStatuses.STALEMATE;
    if (this.isInsufficientMaterial())
      return PositionStatuses.INSUFFICIENT_MATERIAL;
    return PositionStatuses.ONGOING;
  }

  public get legalMovesAsAlgebraicNotation() {
    return this.legalMoves.map((move) => move.getAlgebraicNotation(this.board, this.legalMoves));
  }

  // ===== ===== ===== ===== =====
  // MOVES
  // ===== ===== ===== ===== =====

  protected *forwardPawnCoords(srcCoords: Coordinates) {
    const destCoords1 = srcCoords.getPeer(this.activeColor.direction, 0);

    if (destCoords1 && !this.board.hasCoords(destCoords1))
      yield destCoords1;
  }

  protected *pawnCaptureCoords(srcCoords: Coordinates) {
    for (const destCoords of this.board.attackedCoords(srcCoords))
      if (this.board.getByCoords(destCoords)?.color === this.activeColor.opposite)
        yield destCoords;
  }

  protected *pseudoLegalPawnMoves(srcCoords: Coordinates) {
    for (const destCoords of this.forwardPawnCoords(srcCoords))
      yield new PawnMove(srcCoords, destCoords);

    for (const destCoords of this.pawnCaptureCoords(srcCoords))
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

  public isInsufficientMaterial() {
    const nonKingPieces = this.board.getNonKingPieces();
    const activePieces = nonKingPieces.get(this.activeColor)!;
    const inactivePieces = nonKingPieces.get(this.activeColor.opposite)!;

    if (activePieces.length !== 0 || inactivePieces.length !== 1)
      return false;

    const kingCoords = this.board.getKingCoords(this.activeColor);
    return this.legalMoves.some(({ srcCoords, destCoords }) => {
      return srcCoords === kingCoords && destCoords === inactivePieces[0][0];
    });
  }

  // ===== ===== ===== ===== =====
  // MISC
  // ===== ===== ===== ===== =====

  public toString(): string {
    return [
      this.board.toString(),
      this.activeColor.abbreviation,
      this.fullMoveNumber
    ].join(" ");
  }

  public toJson(): Json.ShatranjPosition {
    return {
      activeColor: this.activeColor.abbreviation,
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