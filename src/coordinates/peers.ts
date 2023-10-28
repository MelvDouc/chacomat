import Coords from "@/coordinates/Coords.ts";
import {
  blackPawnOffsets,
  diagonalOffsets,
  kingOffsets,
  knightOffsets,
  orthogonalOffsets,
  whitePawnOffsets
} from "@/coordinates/offsets.ts";
import { ChacoMat } from "@/typings/chacomat.ts";

export const shortRangePeers = Coords.ALL.map((row) => {
  return row.map((coords) => {
    const kingPeers = getShortRangePeers(coords, kingOffsets);
    const knightPeers = getShortRangePeers(coords, knightOffsets);

    return {
      [1]: getShortRangePeers(coords, whitePawnOffsets),
      [2]: kingPeers,
      [3]: knightPeers,
      [-1]: getShortRangePeers(coords, blackPawnOffsets),
      [-2]: kingPeers,
      [-3]: knightPeers
    } as Record<number, ChacoMat.Coords[]>;
  });
});

export const longRangePeers = Coords.ALL.map((row) => {
  return row.map((coords) => {
    const bishopPeers = getLongRangePeers(coords, diagonalOffsets);
    const rookPeers = getLongRangePeers(coords, orthogonalOffsets);
    const queenPeers = getLongRangePeers(coords, kingOffsets);

    return {
      [4]: bishopPeers,
      [5]: rookPeers,
      [6]: queenPeers,
      [-4]: bishopPeers,
      [-5]: rookPeers,
      [-6]: queenPeers
    } as Record<number, ChacoMat.Coords[][]>;
  });
});

function getShortRangePeers(coords: ChacoMat.Coords, offsets: ChacoMat.PieceOffsets) {
  return offsets.x.reduce((acc, xOffset, i) => {
    const x = coords.x + xOffset;
    const y = coords.y + offsets.y[i];
    if (Coords.isSafe(x, y))
      acc.push(Coords.ALL[x][y]);
    return acc;
  }, [] as ChacoMat.Coords[]);
}

function getLongRangePeers(coords: ChacoMat.Coords, offsets: ChacoMat.PieceOffsets) {
  return offsets.x.reduce((acc, xOffset, i) => {
    let { x, y } = coords;
    const peers: ChacoMat.Coords[] = [];

    while (Coords.isSafe(x += xOffset, y += offsets.y[i]))
      peers.push(Coords.ALL[x][y]);

    if (peers.length > 0)
      acc.push(peers);

    return acc;
  }, [] as ChacoMat.Coords[][]);
}