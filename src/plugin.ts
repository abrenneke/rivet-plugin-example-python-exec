import { RivetPlugin } from "@ironclad/rivet-core";
import { examplePluginNode } from "./nodes/ExamplePluginNode";

export const examplePlugin: RivetPlugin = {
  id: "example-plugin",
  name: "Example Plugin",

  configSpec: {
    exampleSetting: {
      type: "string",
      label: "Example Setting",
      description: "This is an example setting for the example plugin.",
      helperText: "This is an example setting for the example plugin.",
    },
  },

  contextMenuGroups: [
    {
      id: "example",
      label: "Example",
    },
  ],

  register: (register) => {
    register(examplePluginNode);
  },
};
