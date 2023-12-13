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