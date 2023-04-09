const Colors = {
  WHITE: 1,
  BLACK: -1
} as const;

export function reverseColor(color: Color): Color {
  return -color as Color;
}

export type Color = typeof Colors[keyof typeof Colors];
export default Colors;