import GameResults from "$src/constants/GameResults";
import Lexer from "$src/pgn-parser/Lexer.ts";
import Line from "$src/pgn-parser/Line.ts";
import { parseHeader } from "$src/pgn-parser/string-utils.ts";
import {
  CommentToken,
  GameResult,
  NAGToken,
  NotationToken,
  PGNHeaders,
  PGNToken
} from "$src/typings/types.ts";

export default class Parser {
  public readonly headers: PGNHeaders;
  public readonly mainLine: Line;
  public readonly moveTextResult: GameResult | null;
  private readonly tokens: PGNToken[] = [];
  private position = 0;

  public constructor(pgn: string) {
    const lexer = new Lexer(pgn);
    let token: PGNToken;

    do {
      token = lexer.lex();
      if (token.kind !== "whitespace")
        this.tokens.push(token);
    } while (token.kind !== "end-of-input");

    this.headers = this.parseHeaders();
    this.mainLine = this.parseNextLine();
    this.moveTextResult = this.parseMoveTextResult();
  }

  public get result() {
    return this.moveTextResult ?? this.headers.Result ?? GameResults.NONE;
  }

  private get current() {
    return this.tokens[this.position] ?? this.tokens.at(-1)!;
  }

  public getPGNText() {
    const headerString = Object.entries(this.headers)
      .map(([key, value]) => `[${key} "${value}"]`)
      .join("\n");

    return `${headerString}\n\n${this.mainLine.toString()} ${this.result}`;
  }

  private parseHeaders() {
    const headers: PGNHeaders = {};

    while (this.position < this.tokens.length) {
      const token = this.current;
      if (token.kind !== "header") break;

      const { key, value } = parseHeader(token.value);
      headers[key] = value;
      this.position++;
    }

    return headers;
  }

  private parseNextLine(): Line {
    const line = new Line();

    main: while (this.position < this.tokens.length) {
      const token = this.current;

      switch (token.kind) {
        case "comment":
          this.handleComment(line, token);
          break;
        case "notation":
          this.handleNotation(line, token);
          break;
        case "NAG":
          this.handleNAG(line, token);
          break;
        case "opening-parenthesis":
          this.handleVariation(line);
          break;
        case "result":
        case "closing-parenthesis":
          break main;
      }

      this.position++;
    }

    return line;
  }

  private parseMoveTextResult() {
    if (this.current.kind === "result")
      return this.current.value;
    return null;
  }

  private handleComment(variation: Line, token: CommentToken) {
    if (variation.moveNodes.length === 0) {
      variation.comment = token.value;
      return;
    }

    variation.moveNodes.at(-1)!.comment = token.value;
  }

  private handleNotation(variation: Line, token: NotationToken) {
    const moveNumberToken = this.tokens[this.position - 1];

    if (moveNumberToken?.kind === "move-number") {
      variation.moveNodes.push({
        notation: token.value,
        moveNumber: moveNumberToken.value,
        isWhiteMove: moveNumberToken.isWhite
      });
      return;
    }

    const prevNode = variation.moveNodes.at(-1);

    if (!prevNode)
      throw new Error("Missing move number.");

    variation.moveNodes.push({
      notation: token.value,
      moveNumber: prevNode.moveNumber,
      isWhiteMove: !prevNode.isWhiteMove
    });
  }

  private handleNAG(variation: Line, token: NAGToken) {
    const prevNode = variation.moveNodes.at(-1);

    if (prevNode)
      prevNode.NAG = token.value;
  }

  private handleVariation(line: Line) {
    const prevNode = line.moveNodes.at(-1);

    if (!prevNode)
      throw new Error(`Invalid variation.`);

    this.position++;
    const variation = this.parseNextLine();
    prevNode.variations ??= [];
    prevNode.variations.push(variation);
  }
}