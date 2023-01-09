/**
 * Colors are represented by numbers for two reasons:
 * 1) they indicate the inverse xOffset of a pawn move;
 * 2) a color's opposite can easily be inferred with a minus sign (i.e. `colorA === -colorB`).
 */
enum Color {
  WHITE = 1,
  BLACK = -1,
}

export default Color;
