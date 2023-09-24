import Color from "@/base/Color.ts";
import PawnMove from "@/base/moves/PawnMove.ts";
import { ICoords } from "@/typings/types.ts";
import ShatranjPosition from "@/variants/shatranj/ShatranjPosition.ts";
import Board from "@/variants/standard/Board.ts";
import CastlingRights from "@/variants/standard/CastlingRights.ts";
import CastlingMove from "@/variants/standard/moves/CastlingMove.ts";
import EnPassantPawnMove from "@/variants/standard/moves/EnPassantPawnMove.ts";

export default class Position extends ShatranjPosition {
  protected static get Board() {
    return Board;
  }

  protected static get CastlingRights() {
    return CastlingRights;
  }

  public static override get START_FEN() {
    return "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w kqKQ - 0 1";
  }

  public static override fromFen(fen: string) {
    const [pieceStr, clr, castling, enPassant, halfMoveClock, fullMoveNumber] = fen.split(" ");
    const board = new this.Board().addPiecesFromString(pieceStr);

    return new this({
      board,
      activeColor: Color.fromAbbreviation(clr),
      castlingRights: this.CastlingRights.fromString(castling, board.width),
      enPassantCoords: enPassant === "-" ? null : this.Board.getCoordsFromNotation(enPassant),
      halfMoveClock: Number(halfMoveClock),
      fullMoveNumber: Number(fullMoveNumber)
    });
  }

  public static override new(fen?: string) {
    return this.fromFen(fen ?? this.START_FEN);
  }

  declare public readonly board: Board;
  public readonly castlingRights: CastlingRights;
  public readonly halfMoveClock: number;
  public readonly enPassantCoords: ICoords | null;

  public constructor({ activeColor, board, castlingRights, enPassantCoords, halfMoveClock, fullMoveNumber }: {
    activeColor: Color;
    board: Board;
    castlingRights: CastlingRights;
    enPassantCoords: ICoords | null;
    fullMoveNumber: number;
    halfMoveClock: number;
  }) {
    super({ board, activeColor, fullMoveNumber });
    this.castlingRights = castlingRights;
    this.enPassantCoords = enPassantCoords;
    this.halfMoveClock = halfMoveClock;
  }

  public override isCheckmate() {
    return this.isCheck() && !this.legalMoves.length;
  }

  public override isStalemate() {
    return !this.isCheck() && !this.legalMoves.length;
  }

  public isTripleRepetition() {
    const boardStr = this.board.toString();
    let current: Position | undefined = this.prev?.prev;
    let count = 1;

    while (current && count < 3) {
      if (current.board.toString() === boardStr)
        count++;
      current = current.prev?.prev;
    }

    return count === 3;
  }

  public isInsufficientMaterial() {
    if (this.board.pieceCount() > 4)
      return false;

    const nonKingPieces = this.board.nonKingPieces();
    const activePieces = nonKingPieces.get(this.activeColor)!;
    const inactivePieces = nonKingPieces.get(this.activeColor.opposite)!;
    const [inactiveCoords0, inactivePiece0] = inactivePieces[0] ?? [];

    if (activePieces.length === 0)
      return inactivePieces.length === 0
        || inactivePieces.length === 1 && (inactivePiece0.isKnight() || inactivePiece0.isBishop());

    if (activePieces.length === 1) {
      const [activeCoords0, activePiece0] = activePieces[0];
      if (inactivePieces.length === 0)
        return activePiece0.isKnight() || activePiece0.isBishop();
      return inactivePieces.length === 1
        && activePiece0.isBishop()
        && inactivePiece0.isBishop()
        && activeCoords0.isLightSquare() === inactiveCoords0.isLightSquare();
    }

    return false;
  }

  public override toString() {
    const castlingStr = this.castlingRights.toString(this.board.height, this.board.width);
    return `${this.board} ${this.activeColor.abbreviation} ${castlingStr} ${this.enPassantCoords?.notation ?? "-"} ${this.halfMoveClock} ${this.fullMoveNumber}`;
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      halfMoveClock: this.halfMoveClock,
      enPassantCoords: this.enPassantCoords,
      castlingRights: {
        [Color.WHITE.abbreviation]: [...this.castlingRights.get(Color.WHITE)!],
        [Color.BLACK.abbreviation]: [...this.castlingRights.get(Color.BLACK)!]
      }
    };
  }

  // ===== ===== ===== ===== =====
  // PROTECTED
  // ===== ===== ===== ===== =====

  protected override *forwardPawnMoves(srcCoords: ICoords) {
    const forwardCoords = srcCoords.peer(this.activeColor.direction, 0);

    if (forwardCoords && !this.board.has(forwardCoords)) {
      yield new PawnMove(srcCoords, forwardCoords);

      if (srcCoords.x === this.activeColor.getPawnRank(this.board.height)) {
        const forwardCoords = srcCoords.peer(this.activeColor.direction * 2, 0);

        if (forwardCoords && !this.board.has(forwardCoords))
          yield new PawnMove(srcCoords, forwardCoords);
      }
    }
  }

  protected override *pawnCaptures(srcCoords: ICoords) {
    for (const destCoords of this.board.attackedCoords(srcCoords)) {
      if (this.board.get(destCoords)?.color === this.activeColor.opposite) {
        yield new PawnMove(srcCoords, destCoords);
        continue;
      }
      if (destCoords === this.enPassantCoords)
        yield new EnPassantPawnMove(srcCoords, destCoords);
    }
  }

  protected getCastlingMove(kingCoords: ICoords, rookSrcY: number) {
    return new CastlingMove(
      kingCoords,
      this.board.coords(kingCoords.x, this.board.castledKingFiles[Math.sign(rookSrcY - kingCoords.y) as -1 | 1]),
      this.board.coords(kingCoords.x, rookSrcY)
    );
  }

  protected *castlingMoves() {
    const attackedCoords = this.board.getAttackedCoordsSet(this.activeColor.opposite);
    const kingCoords = this.board.getKingCoords(this.activeColor);
    if (attackedCoords.has(kingCoords)) return;

    for (const rookSrcY of this.castlingRights.get(this.activeColor))
      if (this.board.canCastle(rookSrcY, this.activeColor, attackedCoords))
        yield this.getCastlingMove(kingCoords, rookSrcY);
  }

  protected override computeLegalMoves() {
    return super.computeLegalMoves().concat(...this.castlingMoves());
  }
}