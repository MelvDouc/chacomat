import dts from "bun-plugin-dts";

await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  format: "esm",
  external: [
    "pgnify"
  ],
  plugins: [
    dts()
  ]
});
const contents = await Bun.file("dist/index.js").text();
await Bun.write("dist/index.js", contents + "\nexport * as ChacoMat from \"./index.d.ts\";");