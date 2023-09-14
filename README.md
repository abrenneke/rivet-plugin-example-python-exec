# Rivet Example Plugin

This project is an example of a [Rivet](https://github.com/Ironclad/rivet) plugin. It is a minimal TypeScript Rivet plugin that adds a single node called Example Plugin Node.

- [Using the plugin](#using-the-plugin)
- [Making your own plugin](#making-your-own-plugin)
  - [⚠️ Important Notes ⚠️](#️-important-notes-️)
  - [1. Plugin Definition](#1-plugin-definition)
  - [2. Node Definitions](#2-node-definitions)
  - [3. Bundling](#3-bundling)
  - [4. Committing](#4-committing)
  - [5. Serving your plugin](#5-serving-your-plugin)

## Using the plugin

To use this plugin in Rivet:

1. Navigate to the Project tab in the left sidebar. You will see a + button next to `Plugins`,
   click it to open the Add Plugin modal.
2. In Add Remote Plugin, use this plugin's: [jsdelivr](https://www.jsdelivr.com/) URL:

   ```
   https://cdn.jsdelivr.net/gh/abrenneke/rivet-plugin-example@main/dist/bundle.js
   ```

3. The example plugin is now installed in your project. You can add the Example Plugin Node using the Add Node menu.

## Making your own plugin

### ⚠️ Important Notes ⚠️

- You must bundle your plugins, or include all code for your plugin in the ESM files. Plugins are loaded using `import(pluginUrl)` so must follow all rules for ESM modules. This means that you cannot use `require` or `module.exports` in your plugin code. If you need to use external libraries, you must bundle them.

- You also cannot import nor bundle `@ironclad/rivet-core` in your plugin. The rivet core library is passed into your default export function as an argument. Be careful to only use `import type` statements for the core library, otherwise your plugin will not bundle successfully.

This repository has examples for both bundling with [ESBuild](https://esbuild.github.io/) and only importing types from `@ironclad/rivet-core`.

### 1. Plugin Definition

Follow the example in [src/index.ts](src/index.ts) to define your plugin. Your plugin must default-export a function that takes in the Rivet Core library as its only argument, and returns a valid `RivetPlugin` object.

### 2. Node Definitions

Follow the example in [src/nodes/ExamplePluginNode.ts](src/nodes/ExamplePluginNode.ts) to define your plugin's nodes. You should follow a simlar syntax of exporting functions that take in the Rivet Core library.

- Nodes must implement `PluginNodeDefinition<T>` by calling `pluginNodeDefinition(yourPluginImpl, "Node Name")`.
- Node implementations must implement `PluginNodeImpl<T>`.
- `T` should be your plugin's type definition.

### 3. Bundling

See [bundle.ts](bundle.ts) for an example of how to bundle your plugin. You can use any bundler you like, but you must bundle your plugin into a single file. You can use the [ESBuild](https://esbuild.github.io/) bundler to bundle your plugin into a single file.

It is important that all external libraries are bundled, because browsers cannot load bare imports.

### 4. Committing

You should commit your bundled files to your repository, or provide your plugin on NPM.

### 5. Serving your plugin

You should use a CDN to serve your plugin. You can use [jsdelivr](https://www.jsdelivr.com/) to serve your plugin. You can use the following URL to serve your plugin (assuming you have bundled to `dist/bundle.js`):

```
https://cdn.jsdelivr.net/gh/<your-github-username>/<your-repo-name>@<your-branch-name>/dist/bundle.js
```

If you have published your plugin on NPM, you can use the following URL:

```
https://cdn.jsdelivr.net/npm/<your-package-name>/dist/bundle.js
```
