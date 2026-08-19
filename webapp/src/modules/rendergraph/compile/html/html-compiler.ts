import type {RenderGraphNode} from "@modules/rendergraph/nodes/rg-node.ts";
import type {HtmlCommand} from "@modules/rendergraph/compile/html/html-command.ts";

interface CompileContext {
    nodes: RenderGraphNode[];
    commands: HtmlCommand[];
}

export function htmlCompile(nodes: RenderGraphNode[]) {

    const context: CompileContext = {
        nodes: nodes,
        commands: [],
    };

    nodes.filter(it => it.type === "html-container").map(containerNode => {
        containerNode.renderPasses.forEach(_htmlDrawNode => {
            // TODO
        });
    });

    return {
        commands: context.commands,
    };
}
