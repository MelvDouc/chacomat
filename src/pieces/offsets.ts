export const whitePawnOffsets = {
  x: [-1, -1],
  y: [-1, 1]
};

export const blackPawnOffsets = {
  x: [1, 1],
  y: [-1, 1]
};

export const knightOffsets = {
  x: [-1, -2, -2, -1, 1, 2, 2, 1],
  y: [-2, -1, 1, 2, 2, 1, -1, -2]
};

export const orthogonalOffsets = {
  x: [0, -1, 0, 1],
  y: [-1, 0, 1, 0]
};

export const diagonalOffsets = {
  x: [-1, -1, 1, 1],
  y: [-1, 1, 1, -1]
};

export const kingOffsets = {
  x: orthogonalOffsets.x.flatMap((xOffset, i) => [xOffset, diagonalOffsets.x[i]]),
  y: orthogonalOffsets.y.flatMap((yOffset, i) => [yOffset, diagonalOffsets.y[i]])
};