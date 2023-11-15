import {
  EOF,
  isGameResult,
  isNAG,
  isValuedTokenChar,
  isWhiteSpace
} from "$src/pgn-parser/string-utils.ts";
import { PGNToken } from "$src/typings/types.ts";

export default class Lexer {
  private static readonly valueLessTokens = {
    EndOfInput: { kind: "end-of-input" },
    Whitespace: { kind: "whitespace" },
    OpeningParenthesis: { kind: "opening-parenthesis" },
    ClosingParenthesis: { kind: "closing-parenthesis" }
  } as const;

  private readonly input: string;
  private position = 0;

  public constructor(input: string) {
    this.input = input;
  }

  private get current() {
    return this.input[this.position] ?? EOF;
  }

  public lex(): PGNToken {
    const char = this.current;

    switch (char) {
      case EOF:
        return Lexer.valueLessTokens.EndOfInput;
      case "[":
        return this.getHeaderToken();
      case "{":
        return this.getCommentToken();
      case "(":
        return this.getOpeningParenthesisToken();
      case ")":
        return this.getClosingParenthesisToken();
      default:
        if (isWhiteSpace(char))
          return this.getWhitespaceToken();
        return this.getValuedToken();
    }
  }

  private scanWhile(predicate: (char: string, substring: string) => boolean) {
    let substring = "";

    for (
      let char = this.current;
      predicate(char, substring) && char !== EOF;
      char = this.current
    ) {
      substring += char;
      this.position++;
    }

    return substring;
  }

  private getHeaderToken(): PGNToken {
    this.position++;
    const header = this.scanWhile((char) => char !== "]");
    this.position++;
    return {
      kind: "header",
      value: header
    };
  }

  private getCommentToken(): PGNToken {
    this.position++;
    const comment = this.scanWhile((char) => char !== "}");
    this.position++;
    return {
      kind: "comment",
      value: comment.trim()
    };
  }

  private getWhitespaceToken() {
    this.scanWhile(isWhiteSpace);
    return Lexer.valueLessTokens.Whitespace;
  }

  private getOpeningParenthesisToken() {
    this.position++;
    return Lexer.valueLessTokens.OpeningParenthesis;
  }

  private getClosingParenthesisToken() {
    this.position++;
    return Lexer.valueLessTokens.ClosingParenthesis;
  }

  private getValuedToken(): PGNToken {
    const value = this.scanWhile(isValuedTokenChar);

    if (isGameResult(value))
      return { kind: "result", value };

    if (isNAG(value))
      return { kind: "NAG", value };

    if (!value.endsWith("."))
      return { kind: "notation", value };

    return {
      kind: "move-number",
      value: parseInt(value),
      isWhite: !value.endsWith("...")
    };
  }
}