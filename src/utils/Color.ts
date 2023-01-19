enum Color {
  WHITE = "WHITE",
  BLACK = "BLACK"
}

export const ReversedColor: Readonly<{
  [Color.WHITE]: Color;
  [Color.BLACK]: Color;
}> = {
  WHITE: Color.BLACK,
  BLACK: Color.WHITE
};

export const colorAbbreviations = {
  w: Color.WHITE,
  b: Color.BLACK,
  [Color.WHITE]: "w",
  [Color.BLACK]: "b",
} as const;

export const ConsoleColors = {
  Reset: "\x1b[0m",
  FgBlack: "\x1b[30m",
  BgWhite: "\x1b[47m",
  BgGreen: "\x1b[42m"
} as const;

export default Color;