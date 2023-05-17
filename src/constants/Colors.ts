const Colors = {
  WHITE: 1,
  BLACK: -1
} as const;

export const ReversedColors = {
  [Colors.WHITE]: Colors.BLACK,
  [Colors.BLACK]: Colors.WHITE
} as const;

export default Colors;