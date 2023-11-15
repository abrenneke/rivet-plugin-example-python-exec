import * as esbuild from "esbuild";
import { match } from "ts-pattern";
import { join, dirname } from "node:path";
import copy from "recursive-copy";
import { platform, homedir } from "node:os";
import { readFile, rm, mkdir, copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Roughly https://github.com/demurgos/appdata-path/blob/master/lib/index.js but appdata local and .local/share, try to match `dirs` from rust
function getAppDataLocalPath() {
  const identifier = "com.ironcladapp.rivet";
  return match(platform())
    .with("win32", () => join(homedir(), "AppData", "Local", identifier))
    .with("darwin", () =>
      join(homedir(), "Library", "Application Support", identifier)
    )
    .with("linux", () => join(homedir(), ".local", "share", identifier))
    .otherwise(() => {
      if (platform().startsWith("win")) {
        return join(homedir(), "AppData", "Local", identifier);
      } else {
        return join(homedir(), ".local", "share", identifier);
      }
    });
}

const syncPlugin: esbuild.Plugin = {
  name: "onBuild",
  setup(build) {
    build.onEnd(async () => {
      const packageJson = JSON.parse(
        await readFile(join(__dirname, "package.json"), "utf-8")
      );
      const pluginName = packageJson.name;

      const rivetPluginsDirectory = join(getAppDataLocalPath(), "plugins");
      const thisPluginDirectory = join(
        rivetPluginsDirectory,
        `${pluginName}-latest`
      );

      await rm(join(thisPluginDirectory, "package"), {
        recursive: true,
        force: true,
      });
      await mkdir(join(thisPluginDirectory, "package"), { recursive: true });

      await copy(
        join(__dirname, "dist"),
        join(thisPluginDirectory, "package", "dist")
      );
      await copyFile(
        join(__dirname, "package.json"),
        join(thisPluginDirectory, "package", "package.json")
      );

      // Copy .git to mark as locally installed plugin
      await copy(
        join(__dirname, ".git"),
        join(thisPluginDirectory, "package", ".git")
      );

      console.log(
        `Synced ${pluginName} to Rivet at ${thisPluginDirectory}. Refresh or restart Rivet to see changes.`
      );
    });
  },
};

// The isomorphic dynamically imports the node entry point, so we need to rewrite the import to point to the
// bundled node entry point instead of the original place it was.
const rewriteNodeEntryPlugin: esbuild.Plugin = {
  name: "rewrite-node-entry",
  setup(build) {
    build.onResolve({ filter: /\/nodeEntry$/ }, (args) => {
      return {
        external: true,
        path: "../dist/nodeEntry.cjs",
      };
    });
  },
};

const isomorphicBundleOptions: esbuild.BuildOptions = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "neutral",
  target: "es2020",
  outfile: "dist/bundle.js",
  format: "esm",
  external: ["./src/nodeEntry"],
  plugins: [rewriteNodeEntryPlugin],
};

const nodeBundleOptions = {
  entryPoints: ["src/nodeEntry.ts"],
  bundle: true,
  platform: "node",
  target: "es2020",
  outfile: "dist/nodeEntry.cjs",
  format: "cjs",
  plugins: [] as esbuild.Plugin[],
} satisfies esbuild.BuildOptions;

// TODO will node bundle always run after isomorphic bundle, or is there a race condition?
if (process.argv.includes("--sync")) {
  nodeBundleOptions.plugins.push(syncPlugin);
}

if (process.argv.includes("--watch")) {
  const isoContext = await esbuild.context(isomorphicBundleOptions);
  await isoContext.watch();

  const nodeContext = await esbuild.context(nodeBundleOptions);
  await nodeContext.watch();

  console.log("Watching for changes...");
} else {
  await esbuild.build(isomorphicBundleOptions);
  await esbuild.build(nodeBundleOptions);
}
