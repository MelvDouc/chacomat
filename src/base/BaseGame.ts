import Color from "@/base/Color.ts";
import GameResults from "@/base/GameResults.ts";
import { GameInfo, GameResult, IChessGame, IMove, IPosition } from "@/typings/types.ts";
import playMoves from "@/utils/play-moves.ts";

export default abstract class BaseGame<TPosition extends IPosition & {
  prev?: TPosition;
  readonly next: TPosition[];
}> implements IChessGame {
  // ===== ===== ===== ===== =====
  // STATIC PUBLIC
  // ===== ===== ===== ===== =====

  public static parsePgn(pgn: string) {
    let matchArray: RegExpMatchArray | null;
    const gameInfo = {} as GameInfo;

    while ((matchArray = pgn.match(/^\[(?<key>\w+)\s+"(?<value>[^"]*)"\]/))?.groups) {
      gameInfo[matchArray.groups["key"]] = matchArray.groups["value"];
      pgn = pgn.slice(matchArray[0].length).trimStart();
    }

    const result = pgn.match(/(\*|1\/2-1\/2|(0|1)-(0|1))$/)?.[0] as GameResult | undefined;

    if (result) {
      pgn = pgn.slice(0, -result.length);
      if (gameInfo.Result && result !== gameInfo.Result)
        console.warn(`Result in move list ("${result}") differs from result in game info ("${gameInfo.Result}").`);
    }

    gameInfo.Result ??= result ?? GameResults.NONE;
    return {
      gameInfo,
      moveList: pgn
    };
  }

  // ===== ===== ===== ===== =====
  // STATIC PROTECTED
  // ===== ===== ===== ===== =====

  protected static get Position(): { new: (fen?: string) => IPosition; } {
    throw new Error(`Method not implemented`);
  }

  // ===== ===== ===== ===== =====
  // PUBLIC
  // ===== ===== ===== ===== =====

  public readonly info: GameInfo;
  #currentPosition: TPosition;
  #firstPosition: TPosition;

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

    this.#currentPosition = (this.constructor as typeof BaseGame).Position.new(this.info.FEN) as TPosition;
    this.#firstPosition = this.#currentPosition;
    if (moveList !== null) playMoves(moveList, this);
  }

  public get currentPosition() {
    return this.#currentPosition;
  }

  public set currentPosition(position: TPosition) {
    this.#currentPosition = position;
    if (!position.prev)
      this.#firstPosition = position;
  }

  public get firstPosition() {
    return this.#firstPosition;
  }

  public abstract getCurrentResult(): GameResult;

  public goBack() {
    if (this.currentPosition.prev)
      this.currentPosition = this.currentPosition.prev;
  }

  public goToStart() {
    this.currentPosition = this.#firstPosition;
  }

  public goForward() {
    if (this.currentPosition.next[0])
      this.currentPosition = this.currentPosition.next[0];
  }

  public goToEnd() {
    let pos = this.#currentPosition;
    while (pos.next[0]) pos = pos.next[0];
    this.currentPosition = pos;
  }

  public abstract playMove(move: IMove): this;

  /**
   * @param notation A computer notation like "e2e4" or "a2a1Q".
   * @returns This same game.
   */
  public playMoveWithNotation(notation: string): this {
    const { board, legalMoves } = this.#currentPosition;
    const move = legalMoves.find((move) => {
      return move.computerNotation(board) === notation;
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
      infoAsStrings.push(`[FEN "${this.#firstPosition.toString()}"]`);

    return infoAsStrings.join("\n");
  }

  public moveListAsString() {
    return this.#firstPosition.toMoveList();
  }

  public toString() {
    return `${this.infoAsString()}\n\n${this.moveListAsString()} ${this.info.Result}`;
  }

  // ===== ===== ===== ===== =====
  // PROTECTED
  // ===== ===== ===== ===== =====

  protected mustAddFENtoInfoString() {
    const { fullMoveNumber, activeColor } = this.#firstPosition;
    return fullMoveNumber !== 1 || activeColor !== Color.WHITE;
  }
}