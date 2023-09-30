const FILES = Array.from({ length: 26 }, (_, i) => String.fromCharCode(i + 97));
const RANKS = Array.from({ length: 8 }, (_, i) => String(8 - i));

export {
  FILES,
  RANKS
};
