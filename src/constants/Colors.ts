const Colors = {
  WHITE: 1,
  BLACK: -1
} as const;

export const ReversedColors = {
  [Colors.WHITE]: Colors.BLACK,
  [Colors.BLACK]: Colors.WHITE
} as const;

export const ConsoleColors = {
  RESET: "\x1b[0m",
  FG_BLACK: "\x1b[30m",
  BG_WHITE: "\x1b[47m",
  BG_GREEN: "\x1b[42m"
} as const;

export default Colors;