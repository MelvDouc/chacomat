import Color from "@/base/Color.ts";
import GameResults from "@/base/GameResults.ts";
import { GameInfo, GameResult, IChessGame, IMove, IPosition } from "@/typings/types.ts";
import playMoves from "@/utils/play-moves.ts";

export default abstract class BaseGame<TPosition extends IPosition & {
  prev?: TPosition;
  readonly next: TPosition[];
}> implements IChessGame {
  protected static get Position(): { new: (fen?: string) => IPosition; } {
    throw new Error(`Method not implemented`);
  }

  public static parsePgn(pgn: string) {
    let matchArray: RegExpMatchArray | null;
    const gameInfo = {} as GameInfo;

    while ((matchArray = pgn.match(/^\[(?<key>\w+)\s+"(?<value>[^"]*)"\]/))?.groups) {
      gameInfo[matchArray.groups["key"]] = matchArray.groups["value"];
      pgn = pgn.slice(matchArray[0].length).trimStart();
    }

    const result = pgn.match(/(\*|1\/2-1\/2|0-(0|1)|1-0)$/)?.[0];

    if (!gameInfo.Result) {
      console.warn("Result missing from game info.");
      if (result) {
        gameInfo.Result = result as GameResult;
      }
    }

    if (!result) {
      console.warn("Result missing from move list.");
    } else if (gameInfo.Result && result !== gameInfo.Result) {
      console.warn(`Result in move list ("${result}") differs from result in game info ("${gameInfo.Result}").`);
    }

    gameInfo.Result ??= GameResults.NONE;
    return {
      gameInfo,
      moveList: pgn
    };
  }

  public readonly info: GameInfo;
  public currentPosition!: TPosition;

  public constructor({ info, pgn }: {
    info?: GameInfo;
    pgn?: string;
  } = {}) {
    info ??= { Result: GameResults.NONE };
    this.info = info;
    let moveList: string | null = null;

    if (pgn) {
      const { gameInfo, moveList: ml } = BaseGame.parsePgn(pgn.trim());
      Object.assign(this.info, gameInfo);
      moveList = ml;
    }

    this.currentPosition = (this.constructor as typeof BaseGame).Position.new(this.info.FEN) as TPosition;
    if (moveList !== null) playMoves(moveList, this);
  }

  public get firstPosition() {
    let pos = this.currentPosition;
    while (pos.prev) pos = pos.prev;
    return pos;
  }

  public abstract getCurrentResult(): GameResult;

  public goBack() {
    if (this.currentPosition.prev)
      this.currentPosition = this.currentPosition.prev;
  }

  public goToStart() {
    this.currentPosition = this.firstPosition;
  }

  public goForward() {
    if (this.currentPosition.next[0])
      this.currentPosition = this.currentPosition.next[0];
  }

  public goToEnd() {
    let pos = this.currentPosition;
    while (pos.next[0]) pos = pos.next[0];
    this.currentPosition = pos;
  }

  public abstract playMove(move: IMove): this;

  /**
   * @param notation A computer notation like "e2e4" or "a2a1Q".
   * @returns This same game.
   */
  public playMoveWithNotation(notation: string) {
    const move = this.currentPosition.legalMoves.find((move) => {
      return notation.startsWith(move.computerNotation());
    });

    if (!move)
      throw new Error(`Illegal move: "${notation}".`);

    return this.playMove(move);
  }

  public infoAsString() {
    const { Result, FEN, ...info } = this.info;
    const infoAsStrings = Object.entries(info)
      .map(([key, value]) => `[${key} "${value}"]`)
      .concat(`[Result "${this.info.Result}"]`);

    if (this.mustAddFENtoInfoString())
      infoAsStrings.push(`[FEN "${this.firstPosition.toString()}"]`);

    return infoAsStrings.join("\n");
  }

  public moveListAsString() {
    return this.firstPosition.toMoveList();
  }

  public toString() {
    return `${this.infoAsString()}\n\n${this.moveListAsString()} ${this.info.Result}`;
  }

  // ===== ===== ===== ===== =====
  // PROTECTED
  // ===== ===== ===== ===== =====

  protected mustAddFENtoInfoString() {
    const { fullMoveNumber, activeColor } = this.firstPosition;
    return fullMoveNumber !== 1 || activeColor !== Color.WHITE;
  }
}