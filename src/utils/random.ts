export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function removeAndReturnRandomElement<T>(array: T[]): T {
  return array.splice(randomInt(0, array.length - 1), 1)[0];
}