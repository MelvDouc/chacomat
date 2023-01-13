import { Board } from "../types.js";

const Reset = "\x1b[0m";
const FgBlack = "\x1b[30m";
const BgWhite = "\x1b[47m";
const BgGreen = "\x1b[42m";

export function viewBoard(board: Board): void {
  console.log(
    Array
      .from({ length: 8 }, (_, x) => {
        let row = "";
        for (let y = 0; y < 8; y++) {
          const char = board.get(board.Coords.get(x, y))?.initial ?? " ";
          const bgColor = (x % 2 === y % 2) ? BgWhite : BgGreen;
          row += `${bgColor + FgBlack} ${char} ${Reset}`;
        }
        return row;
      })
      .join("\n")
  );
}