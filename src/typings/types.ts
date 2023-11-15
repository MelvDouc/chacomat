import Colors from "$src/constants/Colors.ts";
import GameResults from "$src/constants/GameResults";

export type Board = import("$src/game/Board.ts").default;
export type Color = typeof Colors["WHITE"] | typeof Colors["BLACK"];
export type CastlingRights = import("$src/game/CastlingRights.ts").default;
export type ChessGame = import("$src/game/ChessGame.ts").default;
export type Move = import("$src/moves/Move.ts").default;
export type NAG = `$${string}`;
export type Position = import("$src/game/Position.ts").default;
export type SquareIndex = import("$src/constants/SquareIndex.ts").default;
export type Wing = "queenSide" | "kingSide";

export type Piece = import("$src/pieces/Piece.ts").default;
export type WhitePieceInitial = "P" | "N" | "K" | "B" | "R" | "Q";
export type BlackPieceInitial = Lowercase<WhitePieceInitial>;
export type PieceInitial = WhitePieceInitial | BlackPieceInitial;

export interface Point {
  x: number;
  y: number;
}

// ===== ===== ===== ===== =====
// PGN PARSER
// ===== ===== ===== ===== =====

interface BaseHeaders {
  White: string;
  Black: string;
  Site: string;
  Event: string;
  /** Should be in the format `YYYY.MM.DD`. */
  Date: string;
  Result: GameResult;
  EventDate: string;
  Round: string;
  TimeControl: string;
  FEN: string;
  ECO: string;
  Opening: string;
  Variation: string;
  PlyCount: string;
  SetUp: string;
  Termination: string;
  WhiteElo: string;
  BlackElo: string;
  BlackTitle: string;
  WhiteTitle: string;
}

export type PGNHeaders = Partial<BaseHeaders> & {
  [key: string]: string;
};

export type GameResult = typeof GameResults[keyof typeof GameResults];

export interface Line {
  comment?: string;
  readonly moveNodes: MoveNode[];
}

export interface MoveNode {
  notation: string;
  moveNumber: number;
  isWhiteMove: boolean;
  NAG?: NAG;
  comment?: string;
  variations?: Line[];
};

export interface HeaderToken {
  kind: "header";
  value: string;
};

export interface MoveNumberToken {
  kind: "move-number";
  value: number;
  isWhite: boolean;
};

export interface CommentToken {
  kind: "comment";
  value: string;
};

export interface NotationToken {
  kind: "notation";
  value: string;
}

export interface NAGToken {
  kind: "NAG";
  value: NAG;
}

export interface ResultToken {
  kind: "result";
  value: GameResult;
}

export type PGNToken =
  | {
    kind: "end-of-input" | "whitespace" | "opening-parenthesis" | "closing-parenthesis";
  }
  | ResultToken
  | NAGToken
  | CommentToken
  | HeaderToken
  | MoveNumberToken
  | NotationToken;