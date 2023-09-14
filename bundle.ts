import * as esbuild from "esbuild";

const options: esbuild.BuildOptions = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "neutral",
  target: "es2020",
  outfile: "dist/bundle.js",
  format: "esm",
};

if (process.argv.includes("--watch")) {
  const context = await esbuild.context(options);

  await context.watch();

  console.log("Watching for changes...");
} else {
  await esbuild.build(options);
}
