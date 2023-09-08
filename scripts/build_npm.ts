import { build, emptyDir } from "$dev_deps";

const rootDir = Deno.cwd();
const npmDir = `${rootDir}/npm`;

await emptyDir(npmDir);
await build({
  entryPoints: [
    `${rootDir}/src/mod.ts`
  ],
  outDir: npmDir,
  esModule: true,
  scriptModule: false,
  test: false,
  rootTestDir: `${rootDir}/tests`,
  shims: {
    // see JS docs for overview and more options
    deno: true
  },
  importMap: `${rootDir}/deno.json`,
  package: {
    name: "chacomat",
    version: Deno.args[0],
    main: "./esm/mod.js",
    description: "A TypeScript chess game.",
    type: "module",
    scripts: {},
    repository: {
      type: "git",
      url: "git+https://github.com/MelvDouc/chacomat.git"
    },
    keywords: [
      "chess",
      "javascript"
    ],
    author: "Melvin Doucet <melv.douc@gmail.com>",
    license: "ISC",
    bugs: {
      url: "https://github.com/MelvDouc/chacomat/issues"
    },
    homepage: "https://github.com/MelvDouc/chacomat#readme"
  }
});
await Deno.copyFile(`${rootDir}/README.md`, `${npmDir}/README.md`,);