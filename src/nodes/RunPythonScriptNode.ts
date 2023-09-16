// **** IMPORTANT ****
// Make sure you do `import type` and do not pull in the entire Rivet core library here.
// Export a function that takes in a Rivet object, and you can access rivet library functionality
// from there.
import type {
  ChartNode,
  EditorDefinition,
  Inputs,
  InternalProcessContext,
  NodeBodySpec,
  NodeConnection,
  NodeId,
  NodeInputDefinition,
  NodeOutputDefinition,
  NodeUIData,
  Outputs,
  PluginNodeImpl,
  PortId,
  Project,
  Rivet,
} from "@ironclad/rivet-core";

// This defines your new type of node.
export type RunPythonScriptNode = ChartNode<
  "runPythonScript",
  RunPythonScriptNodeData
>;

// This defines the data that your new node will store.
export type RunPythonScriptNodeData = {
  /** The path to the python script to run. If unset, runs scripts/python-script.py */
  scriptPath: string;

  /** Takes in the script path using an input if true/. */
  useScriptPathInput?: boolean;

  /** Arguments to pass to the python script. */
  arguments: string;

  /** Take in the arguments to the script using an input if true. */
  useArgumentsInput?: boolean;
};

// Make sure you export functions that take in the Rivet library, so that you do not
// import the entire Rivet core library in your plugin.
export default function (rivet: typeof Rivet) {
  // This is your main node implementation. It is an object that implements the PluginNodeImpl interface.
  const nodeImpl: PluginNodeImpl<RunPythonScriptNode> = {
    // This should create a new instance of your node type from scratch.
    create(): RunPythonScriptNode {
      const node: RunPythonScriptNode = {
        // Use rivet.newId to generate new IDs for your nodes.
        id: rivet.newId<NodeId>(),

        // This is the default data that your node will store
        data: {
          scriptPath: "",
          arguments: "",
        },

        // This is the default title of your node.
        title: "Run Python Script",

        // This must match the type of your node.
        type: "runPythonScript",

        // X and Y should be set to 0. Width should be set to a reasonable number so there is no overflow.
        visualData: {
          x: 0,
          y: 0,
          width: 200,
        },
      };
      return node;
    },

    // This function should return all input ports for your node, given its data, connections, all other nodes, and the project. The
    // connection, nodes, and project are for advanced use-cases and can usually be ignored.
    getInputDefinitions(
      data: RunPythonScriptNodeData,
      _connections: NodeConnection[],
      _nodes: Record<NodeId, ChartNode>,
      _project: Project
    ): NodeInputDefinition[] {
      const inputs: NodeInputDefinition[] = [];

      if (data.useScriptPathInput) {
        inputs.push({
          id: "scriptPath" as PortId,
          dataType: "string",
          title: "Script Path",
        });
      }

      if (data.useArgumentsInput) {
        inputs.push({
          id: "arguments" as PortId,
          dataType: "string[]",
          title: "Arguments",
        });
      }

      return inputs;
    },

    // This function should return all output ports for your node, given its data, connections, all other nodes, and the project. The
    // connection, nodes, and project are for advanced use-cases and can usually be ignored.
    getOutputDefinitions(
      _data: RunPythonScriptNodeData,
      _connections: NodeConnection[],
      _nodes: Record<NodeId, ChartNode>,
      _project: Project
    ): NodeOutputDefinition[] {
      return [
        {
          id: "output" as PortId,
          dataType: "string",
          title: "Output",
        },
      ];
    },

    // This returns UI information for your node, such as how it appears in the context menu.
    getUIData(): NodeUIData {
      return {
        contextMenuTitle: "Run Python Script",
        group: "Example",
        infoBoxBody:
          "This is an example of running a python script using a rivet node.",
        infoBoxTitle: "Run Python Script Node",
      };
    },

    // This function defines all editors that appear when you edit your node.
    getEditors(
      _data: RunPythonScriptNodeData
    ): EditorDefinition<RunPythonScriptNode>[] {
      return [
        {
          type: "string",
          dataKey: "scriptPath",
          useInputToggleDataKey: "useScriptPathInput",
          label: "Script Path",
        },
        {
          type: "string",
          dataKey: "arguments",
          useInputToggleDataKey: "useArgumentsInput",
          label: "Arguments",
        },
      ];
    },

    // This function returns the body of the node when it is rendered on the graph. You should show
    // what the current data of the node is in some way that is useful at a glance.
    getBody(
      data: RunPythonScriptNodeData
    ): string | NodeBodySpec | NodeBodySpec[] | undefined {
      return rivet.dedent`
        ${data.scriptPath} ${data.arguments}
      `;
    },

    // This is the main processing function for your node. It can do whatever you like, but it must return
    // a valid Outputs object, which is a map of port IDs to DataValue objects. The return value of this function
    // must also correspond to the output definitions you defined in the getOutputDefinitions function.
    async process(
      data: RunPythonScriptNodeData,
      inputData: Inputs,
      context: InternalProcessContext
    ): Promise<Outputs> {
      if (context.executor !== "nodejs") {
        throw new Error("This node can only be run using a nodejs executor.");
      }

      const scriptPath = rivet.getInputOrData(
        data,
        inputData,
        "scriptPath",
        "string"
      );

      let args: string[];

      function splitArgs(args: string): string[] {
        const matcher = /(?:[^\s"]+|"[^"]*")+/g;
        return args.match(matcher) || [];
      }

      const inputArguments = inputData["arguments" as PortId];
      if (data.useArgumentsInput && inputArguments) {
        if (rivet.isArrayDataType(inputArguments.type)) {
          args = rivet.coerceType(inputArguments, "string[]");
        } else {
          const stringArgs = rivet.coerceType(inputArguments, "string");
          args = splitArgs(stringArgs);
        }
      } else {
        args = splitArgs(data.arguments);
      }

      // IMPORTANT
      // It is important that you separate node-only plugins into two separately bundled parts:
      // 1. The isomorphic bundle, which contains the node definition and all the code here
      // 2. The node bundle, which contains the node entry point and any node-only code
      // You are allowed to dynamically import the node entry point from the isomorphic bundle (in the process function)
      const { runPythonScript } = await import("../nodeEntry");

      const output = await runPythonScript(scriptPath, args);

      return {
        ["output" as PortId]: {
          type: "string",
          value: output,
        },
      };
    },
  };

  // Once a node is defined, you must pass it to rivet.pluginNodeDefinition, which will return a valid
  // PluginNodeDefinition object.
  const nodeDefinition = rivet.pluginNodeDefinition(
    nodeImpl,
    "Run Python Script"
  );

  // This definition should then be used in the `register` function of your plugin definition.
  return nodeDefinition;
}
