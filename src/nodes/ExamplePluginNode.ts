import {
  ChartNode,
  EditorDefinition,
  Inputs,
  InternalProcessContext,
  NodeBodySpec,
  NodeConnection,
  NodeId,
  NodeImpl,
  NodeInputDefinition,
  NodeOutputDefinition,
  NodeUIData,
  Outputs,
  PortId,
  Project,
  getInputOrData,
  nodeDefinition,
} from "@ironclad/rivet-core";
import { nanoid } from "nanoid/non-secure";
import { dedent } from "ts-dedent";

export type ExamplePluginNode = ChartNode<
  "examplePlugin",
  ExamplePluginNodeData
>;

export type ExamplePluginNodeData = {
  someData: string;
  useSomeDataInput?: boolean;
};

export class ExamplePluginNodeImpl extends NodeImpl<ExamplePluginNode> {
  static create(): ExamplePluginNode {
    const node: ExamplePluginNode = {
      id: nanoid() as NodeId,
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
  }

  getInputDefinitions(
    _connections: NodeConnection[],
    _nodes: Record<NodeId, ChartNode>,
    _project: Project
  ): NodeInputDefinition[] {
    const inputs: NodeInputDefinition[] = [];

    if (this.data.useSomeDataInput) {
      inputs.push({
        id: "someData" as PortId,
        dataType: "string",
        title: "Some Data",
      });
    }

    return inputs;
  }

  getOutputDefinitions(
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
  }

  static getUIData(): NodeUIData {
    return {
      contextMenuTitle: "Example Plugin",
      group: "Example",
      infoBoxBody: "This is an example plugin node.",
      infoBoxTitle: "Example Plugin Node",
    };
  }

  getEditors(): EditorDefinition<ExamplePluginNode>[] {
    return [
      {
        type: "string",
        dataKey: "someData",
        useInputToggleDataKey: "useSomeDataInput",
        label: "Some Data",
      },
    ];
  }

  getBody(): string | NodeBodySpec | NodeBodySpec[] | undefined {
    return dedent`
      Example Plugin Node
      Data: ${this.data.useSomeDataInput ? "(Using Input)" : this.data.someData}
    `;
  }

  async process(
    inputData: Inputs,
    _context: InternalProcessContext
  ): Promise<Outputs> {
    const someData = getInputOrData(this.data, inputData, "someData", "string");

    return {
      ["someData" as PortId]: {
        type: "string",
        value: someData,
      },
    };
  }
}

export const examplePluginNode = nodeDefinition(
  ExamplePluginNodeImpl,
  "Example Plugin Node"
);
