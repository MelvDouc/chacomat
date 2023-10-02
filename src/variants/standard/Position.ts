import Color from "@/base/Color.ts";
import PawnMove from "@/base/moves/PawnMove.ts";
import ShatranjPosition from "@/variants/shatranj/ShatranjPosition.ts";
import Board from "@/variants/standard/Board.ts";
import CastlingRights from "@/variants/standard/CastlingRights.ts";
import CastlingMove from "@/variants/standard/moves/CastlingMove.ts";
import EnPassantPawnMove from "@/variants/standard/moves/EnPassantPawnMove.ts";

export default class Position extends ShatranjPosition {
  // ===== ===== ===== ===== =====
  // STATIC PUBLIC
  // ===== ===== ===== ===== =====

  public static override get START_FEN() {
    return "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w kqKQ - 0 1";
  }

  public static override fromFen(fen: string) {
    const [boardStr, clr, castling, enPassant, halfMoveClock, fullMoveNumber] = fen.split(" ");
    const board = this.createBoard().addPiecesFromString(boardStr);

    return new this({
      board,
      activeColor: Color.fromAbbreviation(clr),
      castlingRights: this.castlingRightsFromString(castling, board.width),
      enPassantIndex: enPassant === "-" ? -1 : board.notationToIndex(enPassant),
      halfMoveClock: Number(halfMoveClock),
      fullMoveNumber: Number(fullMoveNumber)
    });
  }

  public static override new(fen?: string) {
    return this.fromFen(fen ?? this.START_FEN);
  }

  // ===== ===== ===== ===== =====
  // STATIC PROTECTED
  // ===== ===== ===== ===== =====

  protected static override readonly promotionInitials = new Map([
    [Color.WHITE, ["Q", "R", "B", "N"]],
    [Color.BLACK, ["q", "r", "b", "n"]]
  ]);

  protected static override createBoard() {
    return new Board();
  }

  protected static castlingRightsFromString(str: string, boardWidth: number) {
    return CastlingRights.fromString(str, boardWidth);
  }

  // ===== ===== ===== ===== =====
  // PUBLIC
  // ===== ===== ===== ===== =====

  declare public readonly board: Board;
  public readonly castlingRights: CastlingRights;
  public readonly halfMoveClock: number;
  public readonly enPassantIndex: number;

  public constructor({ activeColor, board, castlingRights, enPassantIndex, halfMoveClock, fullMoveNumber }: {
    activeColor: Color;
    board: Board;
    castlingRights: CastlingRights;
    enPassantIndex: number;
    fullMoveNumber: number;
    halfMoveClock: number;
  }) {
    super({ board, activeColor, fullMoveNumber });
    this.castlingRights = castlingRights;
    this.enPassantIndex = enPassantIndex;
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
    if (this.board.pieceCount > 4)
      return false;

    const nonKingPieces = this.board.nonKingPieces();
    const activePieces = nonKingPieces.get(this.activeColor)!;
    const inactivePieces = nonKingPieces.get(this.activeColor.opposite)!;
    const [inactiveIndex0, inactivePiece0] = inactivePieces[0] ?? [];

    if (activePieces.length === 0)
      return inactivePieces.length === 0
        || inactivePieces.length === 1 && (inactivePiece0.isKnight() || inactivePiece0.isBishop());

    if (activePieces.length === 1) {
      const [activeIndex0, activePiece0] = activePieces[0];
      if (inactivePieces.length === 0)
        return activePiece0.isKnight() || activePiece0.isBishop();
      const activeCoords = this.board.indexToCoords(activeIndex0),
        inactiveCoords = this.board.indexToCoords(inactiveIndex0);
      return inactivePieces.length === 1
        && activePiece0.isBishop()
        && inactivePiece0.isBishop()
        && (activeCoords.x % 2 === activeCoords.y % 2) === (inactiveCoords.x % 2 === inactiveCoords.y % 2);
    }

    return false;
  }

  public override toString() {
    return [
      this.board.toString(),
      this.activeColor.abbreviation,
      this.castlingRights.toString(this.board.width),
      this.enPassantIndex === -1 ? "-" : this.board.indexToNotation(this.enPassantIndex),
      this.halfMoveClock,
      this.fullMoveNumber
    ].join(" ");
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      halfMoveClock: this.halfMoveClock,
      enPassantIndex: this.enPassantIndex,
      castlingRights: {
        [Color.WHITE.abbreviation]: [...this.castlingRights.get(Color.WHITE)!],
        [Color.BLACK.abbreviation]: [...this.castlingRights.get(Color.BLACK)!]
      }
    };
  }

  // ===== ===== ===== ===== =====
  // PROTECTED
  // ===== ===== ===== ===== =====

  protected override *forwardPawnMoves(srcIndex: number) {
    const [move0] = [...super.forwardPawnMoves(srcIndex)];

    if (move0) {
      yield move0;

      if (this.board.indexToRank(srcIndex) === this.board.pawnRank(this.activeColor)) {
        const destIndex = srcIndex + this.board.height * this.activeColor.direction * 2;

        if (!this.board.has(destIndex))
          yield new PawnMove(srcIndex, destIndex);
      }
    }
  }

  protected override *pawnCaptures(srcIndex: number) {
    for (const destIndex of this.board.attackedIndices(srcIndex)) {
      if (this.board.get(destIndex)?.color === this.activeColor.opposite) {
        yield new PawnMove(srcIndex, destIndex);
        continue;
      }

      if (destIndex === this.enPassantIndex)
        yield new EnPassantPawnMove(srcIndex, destIndex);
    }
  }

  protected getCastlingMove(kingIndex: number, rookSrcIndex: number) {
    return new CastlingMove(
      kingIndex,
      this.board.castledKingIndex(this.activeColor, Math.sign(rookSrcIndex - kingIndex)),
      rookSrcIndex
    );
  }

  protected *castlingMoves() {
    if (this.isCheck())
      return;

    const attackedIndices = this.board.getAttackedIndicesSet(this.activeColor.opposite);

    for (const rookSrcY of this.castlingRights.get(this.activeColor)) {
      const rookSrcIndex = this.board.coordsToIndex(
        this.board.pieceRank(this.activeColor),
        rookSrcY
      );
      if (this.board.canCastle(rookSrcIndex, this.activeColor, attackedIndices))
        yield this.getCastlingMove(this.board.getKingIndex(this.activeColor), rookSrcIndex);
    }
  }

  protected override computeLegalMoves() {
    return super.computeLegalMoves().concat(...this.castlingMoves());
  }
}