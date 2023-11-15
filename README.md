<h1 align="center"><img src="https://rivet.ironcladapp.com/img/logo-banner-wide.png" alt="Rivet Logo"></h1>

# Rivet Example Plugin - Python Execution

This project is an example of a [Rivet](https://github.com/Ironclad/rivet) plugin that allows you to execute Python code in a Rivet node.

- [Using the plugin](#using-the-plugin)
  - [In Rivet](#in-rivet)
  - [In Code](#in-code)
- [Making your own plugin](#making-your-own-plugin)
  - [⚠️ Important Notes ⚠️](#️-important-notes-️)
  - [1. Plugin Definition](#1-plugin-definition)
  - [2. Node Definitions](#2-node-definitions)
  - [3. Bundling](#3-bundling)
  - [5. Serving your plugin](#5-serving-your-plugin)
- [Local Development](#local-development)

## Using the plugin

### In Rivet

To use this plugin in Rivet:

1. Navigate to the Project tab in the left sidebar. You will see a + button next to `Plugins`,
   click it to open the Add Plugin modal.
2. In Add NPM Plugin, enter `rivet-plugin-example-python-exec` and click `Add NPM Plugin`.
3. The example plugin is now installed in your project. You can add the Run Python Script using the Add Node menu, in the "Example" group..

### In Code

Load your plugin and Rivet into your application:

```ts
import * as Rivet from "@ironclad/rivet-core";
import examplePlugin from "rivet-plugin-example-python-exec";
```

Register your plugin with Rivet be using the `globalRivetNodeRegistry` or creating a new `NodeRegistration` and registering with that:

```ts
Rivet.globalRivetNodeRegistry.registerPlugin(examplePlugin(Rivet));
```

## Making your own plugin

### ⚠️ Important Notes ⚠️

- You must bundle your plugins, or include all code for your plugin in the ESM files. Plugins are loaded using `import(pluginUrl)` so must follow all rules for ESM modules. This means that you cannot use `require` or `module.exports` in your plugin code. If you need to use external libraries, you must bundle them.

- You also cannot import nor bundle `@ironclad/rivet-core` in your plugin. The rivet core library is passed into your default export function as an argument. Be careful to only use `import type` statements for the core library, otherwise your plugin will not bundle successfully.

- This repo is also an example of a Node.js-only plugin. It is important that Node-only plugins are separated into two separate bundles - an isomorphic bundle that defines the plugin and all of the nodes, and a Node-only bundle that contains the node-only implementations. The isomorphic bundle is allowed to _dynamically_ import the node bundle, but cannot statically import it (except for types, of course).

- **Currently, all node.js dependencies must be bundled into the node entry point, as node_modules is not installed for Rivet.**

This repository has examples for both dual-bundling with [ESBuild](https://esbuild.github.io/), only importing types from `@ironclad/rivet-core`, and using `import()` to dynamically import the node bundle from the isomorphic bundle.

### 1. Plugin Definition

Follow the example in [src/index.ts](src/index.ts) to define your plugin. Your plugin must default-export a function that takes in the Rivet Core library as its only argument, and returns a valid `RivetPlugin` object.

### 2. Node Definitions

Follow the example in [src/nodes/ExamplePluginNode.ts](src/nodes/ExamplePluginNode.ts) to define your plugin's nodes. You should follow a simlar syntax of exporting functions that take in the Rivet Core library.

- Nodes must implement `PluginNodeDefinition<T>` by calling `pluginNodeDefinition(yourPluginImpl, "Node Name")`.
- Node implementations must implement `PluginNodeImpl<T>`.
- `T` should be your plugin's type definition.

### 3. Bundling

See [bundle.ts](bundle.ts) for an example of how to bundle your plugin. You can use any bundler you like, but you must bundle into two final files - an isomorphic bundle, and a node.js only bundle. You can use the [ESBuild](https://esbuild.github.io/) bundler to bundle your plugin into a single file.

It is important that all external libraries are bundled in the _isomorphic bundle_, because browsers cannot load bare imports. However, you are allowed to
import any external libraries in the _node bundle_. Note that as of now, dependencies of a bundle are not loaded. This means that node_modules dependencies must be bundled into the final bundle.

### 5. Serving your plugin

You should then publish your plugin to NPM. The bundled files should be included, and the `"main"` field in your `package.json` should point to the isomorphic bundle.

## Local Development

1. Run `yarn dev` to start the compiler and bundler in watch mode. This will automatically recombine and rebundle your changes into the `dist` folder. This will also copy the bundled files into the plugin install directory.
2. After each change, you must restart Rivet to see the changes.
