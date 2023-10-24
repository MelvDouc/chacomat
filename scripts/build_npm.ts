import { build, emptyDir } from "@dev_deps";

try {
  await main();
} catch (error) {
  console.log(`%cBuild failed.`, "color: red");
  console.log(error);
}

async function main() {
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
    typeCheck: false,
    test: false,
    shims: {
      deno: true,
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
      type: "module",
      main: "./esm/mod.js",
      description: "A TypeScript chess game.",
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
}