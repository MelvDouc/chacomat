import PawnMove from "@/base/moves/PawnMove.ts";
import Color from "@/constants/Color.ts";
import Board from "@/standard/Board.ts";
import CastlingRightsMap from "@/standard/CastlingRightsMap.ts";
import CastlingMove from "@/standard/moves/CastlingMove.ts";
import EnPassantPawnMove from "@/standard/moves/EnPassantPawnMove.ts";
import ShatranjPosition from "@/variants/shatranj/ShatranjPosition.ts";

export default class Position extends ShatranjPosition {
  protected static readonly Board: typeof Board = Board;
  protected static readonly CastlingRightsMap: typeof CastlingRightsMap = CastlingRightsMap;

  public static get START_FEN() {
    return "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w kqKQ - 0 1";
  }

  public static fromFen(fen: string) {
    const [pieceStr, clr, castling, enPassant, halfMoveClock, fullMoveNumber] = fen.split(" ");
    const board = new this.Board().addPiecesFromString(pieceStr);

    return new this({
      board,
      activeColor: Color.fromAbbreviation(clr),
      castlingRights: this.CastlingRightsMap.fromString(castling, board.height, board.width),
      enPassantIndex: enPassant === "-" ? -1 : board.notationToIndex(enPassant),
      halfMoveClock: Number(halfMoveClock),
      fullMoveNumber: Number(fullMoveNumber)
    });
  }

  public static new(fen?: string) {
    return this.fromFen(fen ?? this.START_FEN);
  }

  declare public readonly board: Board;
  public readonly castlingRights: CastlingRightsMap;
  public readonly halfMoveClock: number;
  public readonly enPassantIndex: number;
  declare public prev?: Position;
  public readonly next: Position[] = [];

  public constructor({ activeColor, board, castlingRights, enPassantIndex, halfMoveClock, fullMoveNumber }: {
    activeColor: Color;
    board: Board;
    castlingRights: CastlingRightsMap;
    enPassantIndex: number;
    fullMoveNumber: number;
    halfMoveClock: number;
  }) {
    super({ board, activeColor, fullMoveNumber });
    this.castlingRights = castlingRights;
    this.enPassantIndex = enPassantIndex;
    this.halfMoveClock = halfMoveClock;
  }

  protected computeLegalMoves() {
    return super.computeLegalMoves().concat(...this.castlingMoves());
  }

  protected *castlingMoves() {
    const attackedIndices = this.board.getAttackedIndexSet(this.activeColor.opposite);
    const kingIndex = this.board.getKingIndex(this.activeColor);
    if (attackedIndices.has(kingIndex)) return;

    for (const rookSrcIndex of this.castlingRights.get(this.activeColor)!) {
      if (this.board.canCastle(rookSrcIndex, this.activeColor, attackedIndices))
        yield new CastlingMove(
          kingIndex,
          this.board.getCastledKingIndex(this.activeColor, rookSrcIndex),
          rookSrcIndex
        );
    }
  }

  protected *pseudoLegalPawnMoves(srcIndex: number) {
    const forwardIndex = srcIndex + this.board.height * this.activeColor.direction;

    if (!this.board.has(forwardIndex)) {
      yield new PawnMove(srcIndex, forwardIndex);

      if (this.board.indexToCoords(srcIndex).x === this.activeColor.getPawnRank(this.board.height)) {
        const forwardIndex = srcIndex + this.board.height * this.activeColor.direction * 2;

        if (!this.board.has(forwardIndex))
          yield new PawnMove(srcIndex, forwardIndex);
      }
    }

    for (const destIndex of this.board.attackedIndices(srcIndex)) {
      if (this.board.get(destIndex)?.color === this.activeColor.opposite) {
        yield new PawnMove(srcIndex, destIndex);
        continue;
      }
      if (destIndex === this.enPassantIndex)
        yield new EnPassantPawnMove(srcIndex, destIndex);
    }
  }

  public isCheckmate() {
    return this.isCheck() && !this.legalMoves.length;
  }

  public isStalemate() {
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

    return count >= 3;
  }

  public isInsufficientMaterial() {
    if (this.board.getPieceCount() > 4)
      return false;

    const nonKingPieces = this.board.getNonKingPieces();
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
      return inactivePieces.length === 1
        && activePiece0.isBishop()
        && inactivePiece0.isBishop()
        && this.board.isLightSquare(activeIndex0) === this.board.isLightSquare(inactiveIndex0);
    }

    return false;
  }

  public toString() {
    const enPassantNotation = this.enPassantIndex === -1 ? "-" : this.board.getNotation(this.enPassantIndex);
    const castlingStr = this.castlingRights.toString(this.board.height, this.board.width);
    return `${this.board} ${this.activeColor.abbreviation} ${castlingStr} ${enPassantNotation} ${this.halfMoveClock} ${this.fullMoveNumber}`;
  }

  public toObject() {
    return {
      ...super.toObject(),
      halfMoveClock: this.halfMoveClock,
      enPassantIndex: this.enPassantIndex,
      castlingRights: {
        [Color.WHITE.abbreviation]: [...this.castlingRights.get(Color.WHITE)!],
        [Color.BLACK.abbreviation]: [...this.castlingRights.get(Color.BLACK)!]
      }
    };
  }
}