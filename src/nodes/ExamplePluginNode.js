import { NodeImpl, getInputOrData, nodeDefinition, } from "@ironclad/rivet-core";
import { nanoid } from "nanoid/non-secure";
import { dedent } from "ts-dedent";
export class ExamplePluginNodeImpl extends NodeImpl {
    static create() {
        const node = {
            id: nanoid(),
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
    getInputDefinitions(_connections, _nodes, _project) {
        const inputs = [];
        if (this.data.useSomeDataInput) {
            inputs.push({
                id: "someData",
                dataType: "string",
                title: "Some Data",
            });
        }
        return inputs;
    }
    getOutputDefinitions(_connections, _nodes, _project) {
        return [
            {
                id: "someData",
                dataType: "string",
                title: "Some Data",
            },
        ];
    }
    static getUIData() {
        return {
            contextMenuTitle: "Example Plugin",
            group: "Example",
            infoBoxBody: "This is an example plugin node.",
            infoBoxTitle: "Example Plugin Node",
        };
    }
    getEditors() {
        return [
            {
                type: "string",
                dataKey: "someData",
                useInputToggleDataKey: "useSomeDataInput",
                label: "Some Data",
            },
        ];
    }
    getBody() {
        return dedent `
      Example Plugin Node
      Data: ${this.data.useSomeDataInput ? "(Using Input)" : this.data.someData}
    `;
    }
    async process(inputData, _context) {
        const someData = getInputOrData(this.data, inputData, "someData", "string");
        return {
            ["someData"]: {
                type: "string",
                value: someData,
            },
        };
    }
}
export const examplePluginNode = nodeDefinition(ExamplePluginNodeImpl, "Example Plugin Node");
