import { build, emptyDir } from "@dev_deps";

const rootDir = Deno.cwd();
const npmDir = `${rootDir}/npm`;

await emptyDir(npmDir);
build({
  entryPoints: [
    `${rootDir}/mod.ts`
  ],
  outDir: npmDir,
  esModule: true,
  scriptModule: false,
  test: false,
  // rootTestDir: `${rootDir}/tests`,
  shims: {
    deno: true
  },
  importMap: `${rootDir}/deno.json`,
  compilerOptions: {
    target: "ES2022",
    lib: [
      "ES2022",
      "DOM",
      "DOM.Iterable"
    ]
  },
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
  },
  postBuild: () => {
    Deno.copyFile(`${rootDir}/README.md`, `${npmDir}/README.md`);
  }
});