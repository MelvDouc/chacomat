import type Coords from "@/base/Coords.ts";
import PawnMove from "@/base/moves/PawnMove.ts";
import Color from "@/constants/Color.ts";
import Board from "@/standard/Board.ts";
import CastlingRights from "@/standard/CastlingRights.ts";
import CastlingMove from "@/standard/moves/CastlingMove.ts";
import EnPassantPawnMove from "@/standard/moves/EnPassantPawnMove.ts";
import ShatranjPosition from "@/variants/shatranj/ShatranjPosition.ts";

export default class Position extends ShatranjPosition {
  protected static readonly Board: typeof Board = Board;
  protected static get CastlingRights() {
    return CastlingRights;
  }

  public static get START_FEN() {
    return "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w kqKQ - 0 1";
  }

  public static fromFen(fen: string) {
    const [pieceStr, clr, castling, enPassant, halfMoveClock, fullMoveNumber] = fen.split(" ");
    const board = new this.Board().addPiecesFromString(pieceStr);

    return new this({
      board,
      activeColor: Color.fromAbbreviation(clr),
      castlingRights: this.CastlingRights.fromString(castling, board.height, board.width),
      enPassantCoords: enPassant === "-" ? null : board.Coords.fromNotation(enPassant),
      halfMoveClock: Number(halfMoveClock),
      fullMoveNumber: Number(fullMoveNumber)
    });
  }

  public static new(fen?: string) {
    return this.fromFen(fen ?? this.START_FEN);
  }

  declare public readonly board: Board;
  public readonly castlingRights: CastlingRights;
  public readonly halfMoveClock: number;
  public readonly enPassantCoords: Coords | null;
  declare public prev?: Position;
  public readonly next: Position[] = [];

  public constructor({ activeColor, board, castlingRights, enPassantCoords, halfMoveClock, fullMoveNumber }: {
    activeColor: Color;
    board: Board;
    castlingRights: CastlingRights;
    enPassantCoords: Coords | null;
    fullMoveNumber: number;
    halfMoveClock: number;
  }) {
    super({ board, activeColor, fullMoveNumber });
    this.castlingRights = castlingRights;
    this.enPassantCoords = enPassantCoords;
    this.halfMoveClock = halfMoveClock;
  }

  protected computeLegalMoves() {
    return super.computeLegalMoves().concat(...this.castlingMoves());
  }

  protected *castlingMoves() {
    const attackedCoords = this.board.getAttackedCoordsSet(this.activeColor.opposite);
    const kingCoords = this.board.getKingCoords(this.activeColor);
    if (attackedCoords.has(kingCoords)) return;

    for (const rookSrcY of this.castlingRights.get(this.activeColor)) {
      if (this.board.canCastle(rookSrcY, this.activeColor, attackedCoords))
        yield new CastlingMove(
          kingCoords,
          this.board.getCastledKingCoords(this.activeColor, rookSrcY),
          this.board.Coords.get(kingCoords.x, rookSrcY)
        );
    }
  }

  protected *pseudoLegalPawnMoves(srcCoords: Coords) {
    const forwardCoords = srcCoords.peer(this.activeColor.direction, 0);

    if (forwardCoords && !this.board.has(forwardCoords)) {
      yield new PawnMove(srcCoords, forwardCoords);

      if (srcCoords.x === this.activeColor.getPawnRank(this.board.height)) {
        const forwardCoords = srcCoords.peer(this.activeColor.direction * 2, 0);

        if (forwardCoords && !this.board.has(forwardCoords))
          yield new PawnMove(srcCoords, forwardCoords);
      }
    }

    for (const destCoords of this.board.attackedCoords(srcCoords)) {
      if (this.board.get(destCoords)?.color === this.activeColor.opposite) {
        yield new PawnMove(srcCoords, destCoords);
        continue;
      }
      if (destCoords === this.enPassantCoords)
        yield new EnPassantPawnMove(srcCoords, destCoords);
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

    return count === 3;
  }

  public isInsufficientMaterial() {
    if (this.board.getPieceCount() > 4)
      return false;

    const nonKingPieces = this.board.getNonKingPieces();
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

  public toString() {
    const castlingStr = this.castlingRights.toString(this.board.height, this.board.width);
    return `${this.board} ${this.activeColor.abbreviation} ${castlingStr} ${this.enPassantCoords?.notation ?? "-"} ${this.halfMoveClock} ${this.fullMoveNumber}`;
  }

  public toObject() {
    return {
      ...super.toObject(),
      halfMoveClock: this.halfMoveClock,
      enPassantCoords: this.enPassantCoords,
      castlingRights: {
        [Color.WHITE.abbreviation]: [...this.castlingRights.get(Color.WHITE)!],
        [Color.BLACK.abbreviation]: [...this.castlingRights.get(Color.BLACK)!]
      }
    };
  }
}