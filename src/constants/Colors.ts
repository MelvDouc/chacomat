const Colors = {
  WHITE: 1,
  BLACK: -1,
  [1]: "WHITE",
  [-1]: "BLACK"
} as const;

export const colorAbbreviations = {
  [Colors.WHITE]: "w",
  [Colors.BLACK]: "b",
  w: Colors.WHITE,
  b: Colors.BLACK
} as const;

export default Colors;