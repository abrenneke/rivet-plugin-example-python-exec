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
  dedent,
  newId,
} from "@ironclad/rivet-core";

type ExamplePluginNode = ChartNode<"examplePlugin", ExamplePluginNodeData>;

type ExamplePluginNodeData = {
  someData: string;
  useSomeDataInput?: boolean;
};

export function examplePluginNode(rivet: typeof Rivet) {
  const ExamplePluginNodeImpl: PluginNodeImpl<ExamplePluginNode> = {
    create(): ExamplePluginNode {
      const node: ExamplePluginNode = {
        id: rivet.newId<NodeId>(),
        data: {
          someData: "Hello World",
        },
        title: "Example Plugin Node",
        type: "examplePlugin",
        visualData: {
          x: 0,
          y: 0,
          width: 200,
        },
      };
      return node;
    },

    getInputDefinitions(
      data: ExamplePluginNodeData,
      _connections: NodeConnection[],
      _nodes: Record<NodeId, ChartNode>,
      _project: Project
    ): NodeInputDefinition[] {
      const inputs: NodeInputDefinition[] = [];

      if (data.useSomeDataInput) {
        inputs.push({
          id: "someData" as PortId,
          dataType: "string",
          title: "Some Data",
        });
      }

      return inputs;
    },

    getOutputDefinitions(
      _data: ExamplePluginNodeData,
      _connections: NodeConnection[],
      _nodes: Record<NodeId, ChartNode>,
      _project: Project
    ): NodeOutputDefinition[] {
      return [
        {
          id: "someData" as PortId,
          dataType: "string",
          title: "Some Data",
        },
      ];
    },

    getUIData(): NodeUIData {
      return {
        contextMenuTitle: "Example Plugin",
        group: "Example",
        infoBoxBody: "This is an example plugin node.",
        infoBoxTitle: "Example Plugin Node",
      };
    },

    getEditors(
      _data: ExamplePluginNodeData
    ): EditorDefinition<ExamplePluginNode>[] {
      return [
        {
          type: "string",
          dataKey: "someData",
          useInputToggleDataKey: "useSomeDataInput",
          label: "Some Data",
        },
      ];
    },

    getBody(
      data: ExamplePluginNodeData
    ): string | NodeBodySpec | NodeBodySpec[] | undefined {
      return rivet.dedent`
        Example Plugin Node
        Data: ${data.useSomeDataInput ? "(Using Input)" : data.someData}
      `;
    },

    async process(
      data: ExamplePluginNodeData,
      inputData: Inputs,
      _context: InternalProcessContext
    ): Promise<Outputs> {
      const someData = rivet.getInputOrData(
        data,
        inputData,
        "someData",
        "string"
      );

      return {
        ["someData" as PortId]: {
          type: "string",
          value: someData,
        },
      };
    },
  };

  const examplePluginNode = rivet.pluginNodeDefinition(
    ExamplePluginNodeImpl,
    "Example Plugin Node"
  );

  return examplePluginNode;
}
