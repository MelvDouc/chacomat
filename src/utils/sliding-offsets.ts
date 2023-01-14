export const rookOffsets = {
  x: [0, -1, 1, 0],
  y: [-1, 0, 0, 1]
};

export const bishopOffsets = {
  x: [-1, -1, 1, 1],
  y: [-1, 1, -1, 1]
};

export const adjacentOffsets = {
  x: rookOffsets.x.concat(bishopOffsets.x),
  y: rookOffsets.y.concat(bishopOffsets.y)
};