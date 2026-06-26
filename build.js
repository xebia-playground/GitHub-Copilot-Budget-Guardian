const esbuild = require("esbuild");

esbuild.build({
  entryPoints: ["src/index.js"],
  bundle: true,
  platform: "node",
  target: "node20",
  outfile: "dist/index.js",
  external: []
}).then(() => {
  console.log("Build completed successfully.");
}).catch((err) => {
  console.error(err);
  process.exit(1);
});