// src/nodes/ExamplePluginNode.ts
function examplePluginNode(rivet) {
  const ExamplePluginNodeImpl = {
    create() {
      const node = {
        id: rivet.newId(),
        data: {
          someData: "Hello World"
        },
        title: "Example Plugin Node",
        type: "examplePlugin",
        visualData: {
          x: 0,
          y: 0,
          width: 200
        }
      };
      return node;
    },
    getInputDefinitions(data, _connections, _nodes, _project) {
      const inputs = [];
      if (data.useSomeDataInput) {
        inputs.push({
          id: "someData",
          dataType: "string",
          title: "Some Data"
        });
      }
      return inputs;
    },
    getOutputDefinitions(_data, _connections, _nodes, _project) {
      return [
        {
          id: "someData",
          dataType: "string",
          title: "Some Data"
        }
      ];
    },
    getUIData() {
      return {
        contextMenuTitle: "Example Plugin",
        group: "Example",
        infoBoxBody: "This is an example plugin node.",
        infoBoxTitle: "Example Plugin Node"
      };
    },
    getEditors(_data) {
      return [
        {
          type: "string",
          dataKey: "someData",
          useInputToggleDataKey: "useSomeDataInput",
          label: "Some Data"
        }
      ];
    },
    getBody(data) {
      return rivet.dedent`
        Example Plugin Node
        Data: ${data.useSomeDataInput ? "(Using Input)" : data.someData}
      `;
    },
    async process(data, inputData, _context) {
      const someData = rivet.getInputOrData(
        data,
        inputData,
        "someData",
        "string"
      );
      return {
        ["someData"]: {
          type: "string",
          value: someData
        }
      };
    }
  };
  const examplePluginNode2 = rivet.pluginNodeDefinition(
    ExamplePluginNodeImpl,
    "Example Plugin Node"
  );
  return examplePluginNode2;
}

// src/index.ts
var plugin = (rivet) => {
  const exampleNode = examplePluginNode(rivet);
  const examplePlugin = {
    id: "example-plugin",
    name: "Example Plugin",
    configSpec: {
      exampleSetting: {
        type: "string",
        label: "Example Setting",
        description: "This is an example setting for the example plugin.",
        helperText: "This is an example setting for the example plugin."
      }
    },
    contextMenuGroups: [
      {
        id: "example",
        label: "Example"
      }
    ],
    register: (register) => {
      register(exampleNode);
    }
  };
  return examplePlugin;
};
var src_default = plugin;
export {
  src_default as default,
  plugin
};
