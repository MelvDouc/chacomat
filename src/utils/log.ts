import { Board } from "../types.js";

export function viewBoard(board: Board): void {
  console.log(
    Array
      .from({ length: 8 }, (_, x) => {
        return Array
          .from({ length: 8 }, (_, y) => {
            return board.get(board.Coords.get(x, y)!)?.initial ?? "-";
          })
          .join(" ");
      })
      .join("\n")
  );
}