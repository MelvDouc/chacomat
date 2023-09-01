import Color from "@constants/Color.js";
import Coords from "@constants/Coords.js";
import Wing from "@constants/Wing.js";
import Board from "@game/Board.js";
import CastlingRights from "@game/CastlingRights.js";
import CastlingMove from "@moves/CastlingMove.js";
import Move from "@moves/Move.js";
import PawnMove from "@moves/PawnMove.js";
import { Status } from "@types.js";

export default class Position {
  public static readonly START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  public static readonly Status = {
    ON_GOING: "on going",
    CHECKMATE: "checkmate",
    STALEMATE: "stalemate",
    FIFTY_MOVE_RULE: "50-move rule",
    INSUFFICIENT_MATERIAL: "insufficient material",
    TRIPLE_REPETITION: "triple repetition"
  } as const;

  public static isValidFen(fen: string): boolean {
    return /^[nbrqkNBRQK1-8]+(\/[nbrqkNBRQK1-8]+){7} (w|b) (K?Q?k?q?|-) ([a-h][36]|-) \d+ \d+$/.test(fen);
  }

  public static fromFen(fen: string): Position {
    const [pieceStr, clr, castling, enPassant, halfMoveClock, fullMoveNumber] = fen.split(" ");

    return new this(
      Board.fromString(pieceStr),
      Color.fromAbbreviation(clr),
      CastlingRights.fromString(castling),
      Coords.fromNotation(enPassant),
      Number(halfMoveClock),
      Number(fullMoveNumber)
    );
  }

  public readonly legalMoves: Move[];
  public prev: Position | null = null;
  public next: { move: Move; position: Position; }[] = [];

  public constructor(
    public readonly board: Board,
    public readonly activeColor: Color,
    public readonly castlingRights: CastlingRights,
    public readonly enPassantCoords: Coords | null,
    public readonly halfMoveClock: number,
    public readonly fullMoveNumber: number
  ) {
    this.legalMoves = [];

    for (const move of this.pseudoLegalMoves())
      if (!this.doesMoveCauseCheck(move))
        this.legalMoves.push(move);

    this.legalMoves.push(...this.castlingMoves());
    Object.freeze(this.legalMoves);
  }

  // ===== ===== ===== ===== =====
  // GETTERS
  // ===== ===== ===== ===== =====

  protected get attackedCoordsSet(): Set<Coords> {
    const attackedCoordsSet = new Set<Coords>();

    for (const [srcCoords] of this.board.getPiecesOfColor(this.activeColor.opposite))
      for (const destCoords of this.board.attackedCoords(srcCoords))
        attackedCoordsSet.add(destCoords);

    return attackedCoordsSet;
  }

  public get status(): Status {
    if (!this.legalMoves.length)
      return this.isCheck() ? Position.Status.CHECKMATE : Position.Status.STALEMATE;
    if (this.halfMoveClock >= 50)
      return Position.Status.FIFTY_MOVE_RULE;
    if (this.isTripleRepetition())
      return Position.Status.TRIPLE_REPETITION;
    if (this.isInsufficientMaterial())
      return Position.Status.INSUFFICIENT_MATERIAL;
    return Position.Status.ON_GOING;
  }

  public get legalMovesAsAlgebraicNotation(): string[] {
    return this.legalMoves.map((move) => move.getAlgebraicNotation(this.board, this.legalMoves));
  }

  // ===== ===== ===== ===== =====
  // MOVES
  // ===== ===== ===== ===== =====

  protected doesMoveCauseCheck(move: Move): boolean {
    const undo = move.play(this.board);
    const isCheck = this.isCheck();
    undo();
    return isCheck;
  }

  protected *castlingMoves(): Generator<Move> {
    const kingCoords = this.board.getKingCoords(this.activeColor);
    const { attackedCoordsSet } = this;
    if (attackedCoordsSet.has(kingCoords)) return;

    for (const srcRookY of this.castlingRights.files(this.activeColor)) {
      const wing = Wing.fromDirection(srcRookY - kingCoords.y);
      if (this.board.canCastleToWing(wing, srcRookY, this.activeColor, attackedCoordsSet))
        yield new CastlingMove(kingCoords, Coords.get(kingCoords.x, wing.castledKingY), srcRookY, wing);
    }
  }

  protected *pseudoLegalPawnMoves(srcCoords: Coords): Generator<Move> {
    for (const destCoords of this.board.forwardPawnCoords(this.activeColor, srcCoords))
      yield new PawnMove(srcCoords, destCoords);

    for (const destCoords of this.board.attackedCoords(srcCoords))
      if (this.board.get(destCoords)?.color === this.activeColor.opposite || destCoords === this.enPassantCoords)
        yield new PawnMove(srcCoords, destCoords);
  }

  protected *pseudoLegalMoves(): Generator<Move> {
    for (const [srcCoords, srcPiece] of this.board.getPiecesOfColor(this.activeColor)) {
      if (srcPiece.isPawn()) {
        yield* this.pseudoLegalPawnMoves(srcCoords);
        continue;
      }

      for (const destCoords of this.board.attackedCoords(srcCoords))
        if (this.board.get(destCoords)?.color !== this.activeColor)
          yield new Move(srcCoords, destCoords);
    }
  }

  // ===== ===== ===== ===== =====
  // STATUS
  // ===== ===== ===== ===== =====

  public isCheck(): boolean {
    const kingCoords = this.board.getKingCoords(this.activeColor);

    for (const [srcCoords] of this.board.getPiecesOfColor(this.activeColor.opposite))
      for (const destCoords of this.board.attackedCoords(srcCoords))
        if (destCoords === kingCoords)
          return true;

    return false;
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