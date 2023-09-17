import type Move from "@/base/moves/Move.ts";
import PawnMove from "@/base/moves/PawnMove.ts";
import Color from "@/constants/Color.ts";
import GameResults from "@/constants/GameResults.ts";
import playMoves from "@/pgn/play-moves.ts";
import { GameInfo } from "@/types.ts";
import ShatranjBoard from "@/variants/shatranj/ShatranjBoard.ts";
import ShatranjPiece from "@/variants/shatranj/ShatranjPiece.ts";
import ShatranjPosition from "@/variants/shatranj/ShatranjPosition.ts";

export default class ShatranjGame {
  protected static get Position() {
    return ShatranjPosition;
  };

  public static parsePgn(pgn: string) {
    let matchArray: RegExpMatchArray | null;
    const info: GameInfo = { Result: GameResults.NONE };

    while ((matchArray = pgn.match(/^\[(?<key>\w+)\s+"(?<value>[^"]*)"\]/))?.groups) {
      info[matchArray.groups["key"]] = matchArray.groups["value"];
      pgn = pgn.slice(matchArray[0].length).trimStart();
    }

    return {
      gameInfo: info,
      moveList: pgn
    };
  }

  declare public ["constructor"]: typeof ShatranjGame;
  public readonly info: GameInfo;
  public currentPosition: ShatranjPosition;

  public constructor({ info, pgn }: {
    info?: GameInfo;
    pgn?: string;
  } = {}) {
    this.info = {
      ...(info ?? {}),
      Result: info?.Result ?? GameResults.NONE
    };

    if (pgn) {
      const { gameInfo, moveList } = this.constructor.parsePgn(pgn.trim());
      Object.assign(this.info, gameInfo);
      this.currentPosition = this.constructor.Position.new(this.info.FEN);
      playMoves(moveList, this);
    } else {
      this.currentPosition = this.constructor.Position.new(this.info.FEN);
    }

  }

  public get firstPosition(): this["currentPosition"] {
    let pos = this.currentPosition;
    while (pos.prev) pos = pos.prev;
    return pos;
  }

  public updateResult() {
    if (this.currentPosition.isCheckmate()) {
      this.info.Result = (this.currentPosition.activeColor === Color.WHITE)
        ? GameResults.BLACK_WIN
        : GameResults.WHITE_WIN;
      return;
    }
    if (this.currentPosition.isStalemate()) {
      this.info.Result = GameResults.DRAW;
      return;
    }
    this.info.Result = GameResults.NONE;
  }

  public goToStart() {
    this.currentPosition = this.firstPosition;
  }

  public goBack() {
    const { prev } = this.currentPosition;
    if (prev) this.currentPosition = prev;
  }

  public playMove(move: Move) {
    const pos = this.currentPosition;
    const board = pos.board.clone() as ShatranjBoard;
    const srcPiece = board.get(move.srcCoords)!;

    if (move instanceof PawnMove && move.isPromotion(board))
      move.promotedPiece = ShatranjPiece.fromInitial(srcPiece.color === Color.WHITE ? "Q" : "q")!;

    move.try(board);

    const nextPos = new this.constructor.Position({
      board,
      activeColor: pos.activeColor.opposite,
      fullMoveNumber: pos.fullMoveNumber + Number(pos.activeColor === Color.BLACK)
    });
    nextPos.prev = pos;
    nextPos.srcMove = move;
    pos.next.push(nextPos);
    this.currentPosition = nextPos;
    return this;
  }

  /**
   * @param notation A computer notation like "e2e4" or "a2a1Q".
   * @returns This same game.
   */
  public playMoveWithNotation(notation: string) {
    const move = this.currentPosition.legalMoves.find((move) => {
      return notation.startsWith(move.getComputerNotation());
    });

    if (!move)
      throw new Error(`Illegal move: "${notation}".`);

    return this.playMove(move);
  }

  public infoAsString() {
    const { Result, FEN, ...info } = this.info;
    const startFen = this.firstPosition.toString();
    const infoAsStrings = Object.entries(info)
      .map(([key, value]) => `[${key} "${value}"]`)
      .concat(`[Result "${this.info.Result}"]`);

    if (startFen !== this.constructor.Position.START_FEN)
      infoAsStrings.push(`[FEN "${startFen}"]`);

    return infoAsStrings.join("\n");
  }

  public moveListAsString() {
    return this.firstPosition.toMoveList();
  }

  public toString() {
    return `${this.infoAsString()}\n\n${this.moveListAsString()} ${this.info.Result}`;
  }
}