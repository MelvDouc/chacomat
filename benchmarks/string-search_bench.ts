const testString = `1.d4 d5 2.c4 c6 3.Nf3 e6 4.Nc3 f5 5.Bf4 Nf6 6.e3 Be7 7.Bd3 O-O 8.h3 Ne4 9.O-O Nd7 10.Rc1
Ng5 11.Nxg5 Bxg5 12.Bh2 dxc4 13.Bxc4 Nb6 14.Bb3 Qe7 15.Ne2 Bd7 16.Nf4 Bxf4 17.Bxf4 Nd5 18.Be5 Be8 19.Qc2 a6
20.Qc5 Qg5 21.Kh2 Bh5 22.a4 Bg6 23.Bc4 Rac8 24.Rfe1 Qd8 25.Qa3 Qd7 26.Rcd1 Rce8 27.f3 Rd8 28.a5 Rde8 29.Re2
Rf7 30.Qa2 h5 31.Qb3 Kh7 32.Rde1 Qe7 33.Rg1 Nf6 34.Qc3 Nd7 35.Bg3 Kg8 36.Bb3 Nf6 37.Qd2 Qd8 38.Qe1 Bh7
39.Qd2 Bg6 40.Rc1 Kh7 41.Qe1 Qe7 42.Rc5 Nd7 43.Rc4 Qd8 44.Bh4 Qc7+ 45.Bg3 Qd8 46.Rc1 Nf6 47.Rc5 Nd7 48.Bh4
Qb8+ 49.Bg3 Qd8 50.Rc4 Nf6 51.Kh1 Qd5 52.Be5 Qb5 53.Ba2 Qd5 54.Bb3 Qd7 55.Rc5 Qe7 56.Bg3 Nd7 57.Rc4 Nf6
58.Rc5 Nd7 59.Rc4 Nf6 60.Rc1 Kh8 61.Kh2 Bh7 62.Bh4 Rff8 63.Rc5 Qd6+ 64.Kg1 Nd7 65.Rc4 Rf7 66.Kh1 Bg6 67.Bg3
Qf8 68.Rb4 Nf6 69.Be5 Qe7 70.Bc4 Qd8 71.Rb3 Nd7 72.Bg3 Nf8 73.Bh4 Qc7 74.Rd3 Bh7 75.Rd1 Ng6 76.Bg5 Nf8
77.b4 Bg6 78.Bh4 Nh7 79.Rc1 Nf6 80.Ba2 Qd6 81.Bg3 Qe7 82.Rc5 Nd7 83.Rc1 Bh7 84.Bb3 Bg6 85.Kh2 Kh7 86.Ba2
Nf6 87.Rc5 Nd7 88.Rc1 Nf6 89.Kh1 Qf8 90.Be5 Qe7 91.Bg3 Rff8 92.Kg1 Rf7 93.Rc5 Nd7 94.Rc1 Nf6 95.Kh2 Rff8
96.Bb1 Rd8 97.Rc4 Rfe8 98.Rc1 Rd5 99.Kg1 Qf8 100.Rc4 Kh8 101.Ba2 Kh7 102.Kh2 Rdd8 103.Bc7 Rc8 104.Bf4 Qe7
105.Bb1 Rf8 106.Bg3 Rce8 107.Kh1 Rf7 108.Rc5 Nd7 109.Rc1 Nf6 110.Rc4 Nd5 111.Rc5 Ref8 112.Ba2 Qd7 113.Bb1
Kg8 114.Ba2 Kh7 115.Bb3 Re8 116.Bc2 Qd8 117.Kh2 Ref8 118.Bb3 Kh8 119.Be5 Kh7 120.Kg1 Qe7 121.Ba2 Nf6 122.Bg3
Nd7 123.Rc1 Nf6 124.Rb2 Re8 125.h4 Nd5 126.Be5 Rd8 127.Bb1 Rff8 128.Ba2 Kg8 129.Rc5 Qf7 130.Rc4 Rd7 131.Rc1
Rdd8 132.Rc4 Kh7 133.Rc1 Qe7 134.Bb1 Rd7 135.Ba2 Re8 136.Kh2 Rdd8 137.Kg1 Rd7 138.Bb1 Rf8 139.Rc5 Rdd8
140.Rcc2 Qf7 141.Ba2 Rd7 142.Rc4 Qe7 143.Kh2 Rdd8 144.Rc1 Rfe8 145.Bb1 Qf7 146.Kg1 Rf8 147.Ba2 Kg8 148.Rc5
Kh7 149.Rc4 Kg8 150.Kh1 Qe8 151.Kg1 Rd7 152.Rc5 Bh7 153.Rbc2 Bg6 154.Re2 Qf7 155.Rc4 Kh7 156.Kh1 Qe7 157.Kg1
Re8 158.Rb2 Rf8 159.Rc5 Rf7 160.Re2 Rf8 161.Kh1 Rdd8 162.Kg1 Qf7 163.Rc1 Kg8 164.Rc4 Rd7 165.Rc5 Kh7 166.Bb3
Rdd8 167.Ba2 Kg8 168.Bb1 Rd7 169.Ra2 Nf6 170.Rc1 Nd5 171.g3 Rfd8 172.Rg2 Rf8 173.Rcc2 Qe8 174.Rb2 Qf7
175.Kh2 Kh7 176.Rg1 Kg8 177.Bc2 Qe8 178.Bb1 Kh7 179.Bc2 Kg8 180.Bb1 Qf7 181.Bd3 Rdd8 182.Rbg2 Rd7 183.Rf1
Qe8 184.Rfg1 Kh7 185.Bc4 Qf7 186.Ba2 Kg8 187.Rb2 Qe8 188.Bb3 Kh7 189.Bd1 Nf6 190.Rbg2 Qf7 191.Be2 Kg8 192.Bd3
Nd5 193.Bb1 Qe8 194.Rc2 Qe7 195.Rc5 Qf7 196.Ba2 Rdd8 197.Rc4 Qd7 198.Rg2 Rf7 199.Rg1 Qe7 200.Bf4 Rff8 201.Bb1 Kh8 202.Rc5 Rde8 203.Be5 Bh7 204.Qd2 Rf7 205.Kh3 Ref8 206.Bf4 Qd7 207.Kg2 Bg6 208.Rh1 Qd8 209.Kg1 Rd7 210.Rh2 Qe8 211.Be5 Nf6 212.Rc1 Rff7 213.Bf4 Nd5 214.Be5 Rf8 215.Rf2 Nf6 216.Rcf1 Rg8 217.Qc1 Kh7 218.Qc3 Qe7 219.Qc5 Qf7 220.e4 Qe7 221.exf5 Bxf5 222.Ba2 Rgd8 223.Re1 Nd5 224.Bxd5 exd5 225.Rfe2 Re8 226.Qxe7 Rdxe7 227.Re3 Bg6 228.Kf2 Bc2 229.Ke2 Bf5 230.Kd2 Kg8 231.Rg1 Rf7 232.Kc3 Kh7 233.Rc1 Kg8 234.Rg1 Kh7 235.Kd2 Kg6 236.Rge1 Bd7 237.Rc1 Bf5 238.Rce1 Bd7 239.Rc1 Bf5 240.Rg1 Kh7 241.Rge1 Rfe7 242.Rg1 Rf7 243.Rge1 Rfe7 244.Rc3 Kg8 245.Rg1 Rf7 246.Re1 Kh7 247.Ra1 Kg6 248.Re1 Ree7 249.Kc1 Re8 250.Kd2 Kh7 251.Rg1 Kg8 252.Ra1 Kh7 253.Re1 Kg6 254.Rg1 Bd7 255.Re1 Rff8 256.Kc2 Bf5+ 257.Kb2 Rf7 258.Kc1 Ree7 259.Kd2 Re8 260.Kc1 Kh7 261.Kb2 Bd7 262.Kc2 Kg6 263.Rce3 Bh3 264.Bf4 Rxe3 265.Rxe3 Bf5+ 266.Kd2 Bd7 267.Re1 Rf5 268.Ke3 Rf6 269.Be5 Rf7 270.Rg1 Re7 271.Rc1 Re8 272.Kf4 Rf8+ 273.Ke3 Rf7 274.Bd6 Rf6 275.Be5 Rf7 276.Bd6 Rf6 277.Bb8 Re6+ 278.Be5 Re8 279.Kd2 Rf8 280.Ke2 Re8 281.Ke1 Bf5 282.Kd2 Rf8 283.Bd6 Rf7 284.Bf4 Re7 285.Be5 Be6 286.Rc5 Re8 287.Ke2 Bf5 288.Rc1 Re7 289.Kd2 Bh3 290.Ke2 Rf7 291.Bf4 Re7+ 292.Be5 Bf5 293.Rc3 Kf7 294.Ke3 Re8 295.Rc5 Kg8 296.Rc1 Rf8 297.Bd6 Rf7 298.Bf4 Kf8 299.Re1 Ke8 300.Rg1 Bc2 301.Rc1 Bf5 302.Rg1 Bc2 303.Ra1 Kd7 304.g4 hxg4 305.fxg4 g6 306.h5 gxh5 307.gxh5 Ke6 308.h6 Bh7 309.Rh1 Be4 310.Rg1 Ke7 311.Rg8 Kd7 312.Rb8 Ke6 313.Rg8 Bh7 314.Rd8 Be4 315.Rg8 Bh7 316.Rd8 Be4 317.Rb8 Re7 318.Rf8 Rf7 319.Rc8 Ke7 320.Rg8 Ke6 321.Rd8 Kf5 322.Rg8 Ke6 323.Rg4 Ke7 324.Rg1 Ke6 325.Rg4 Ke7 326.Rg1 Kd7 327.Rg5 Ke6 328.Rg3 Kd7 329.Rg5 Ke7 330.Rg4 Ke8 331.Rg8+ Ke7 332.Be5 Bh7 333.Rh8 Kd7 334.Bf4 Be4 335.Ra8 Ke6 336.Rb8 Rd7 337.Kf2 Kf7 338.Kg3 Kg6 339.Kh4 Rf7 340.Bg5 Kh7 341.Bc1 Kg6 342.Rg8+ Kh7 343.Re8 Bd3 344.Kg3 Bb5 345.Rc8 Bc4 346.Kg4 Be2+ 347.Kg5 Bd3 348.Rd8 Bb5 349.Be3 Bd3 350.Kh4 Bf5 351.Bc1 Be4 352.Kh3 Rf1 353.Bd2 Rh1+ 354.Kg4 Rg1+ 355.Kh4 Rh1+ 356.Kg5 Rg1+ 357.Kf6 1/2-1/2`;
const testChars = [...testString];

const isWhiteSpace_regex = (() => {
  const whiteSpaceRegex = /\s/;
  return (char: string) => whiteSpaceRegex.test(char);
})();

function isWhiteSpace_logic(char: string) {
  return char === " "
    || char === "\n"
    || char === "\t"
    || char === "\r"
    || char === "\f"
    || char === "\v"
    || char === "\u00a0"
    || char === "\u1680"
    || char === "\u2000"
    || char === "\u200a"
    || char === "\u2028"
    || char === "\u2029"
    || char === "\u202f"
    || char === "\u205f"
    || char === "\u3000"
    || char === "\ufeff";
}

const isDigit_regex = (() => {
  const digitRegex = /\d/;
  return (char: string) => digitRegex.test(char);
})();

function isDigit_logic(char: string) {
  return char === "0"
    || char === "1"
    || char === "2"
    || char === "3"
    || char === "4"
    || char === "5"
    || char === "6"
    || char === "7"
    || char === "8"
    || char === "9";
}

const splitOnWhiteSpace_matchAll = (() => {
  const regex = /\S+/gm;

  return (str: string) => {
    const substrings: string[] = [];

    for (const { 0: substring } of str.matchAll(regex))
      substrings.push(substring);

    return substrings;
  };
})();

const splitOnWhiteSpace_split = (() => {
  const regex = /\s+/;
  return (str: string) => str.split(regex);
})();

Deno.bench("isWhiteSpace - regex", () => {
  testChars.filter((c) => isWhiteSpace_regex(c));
});

Deno.bench("isWhiteSpace - logic", () => {
  testChars.filter((c) => isWhiteSpace_logic(c));
});

Deno.bench("isDigit - logic", () => {
  testChars.filter((c) => isDigit_logic(c));
});

Deno.bench("isDigit - regex", () => {
  testChars.filter((c) => isDigit_regex(c));
});

Deno.bench("split string on white space - regex", () => {
  splitOnWhiteSpace_matchAll(testString);
});

Deno.bench("split string on white space - split", () => {
  splitOnWhiteSpace_split(testString);
});