import {RenderGraphCompiler} from "../graph/renderGraphCompiler";
import {HtmlRenderCommand} from "./htmlRenderCommand";
import {AbstractRenderNode} from "../graph/abstractRenderNode";
import {HtmlRenderNode} from "../graph/htmlRenderNode";
import {NodeOutput} from "../graph/nodeOutput";

export class HtmlRenderGraphCompiler implements RenderGraphCompiler<HtmlRenderCommand.Base> {


    public validate(nodes: AbstractRenderNode[]): [boolean, string] {
        if (nodes.length === 0) {
            return [false, "graph is empty"];
        }
        for (let node of nodes) {
            if (node instanceof HtmlRenderNode) {
                const containerCount = node.config.output.count(it => it instanceof NodeOutput.HtmlContainer);
                if (containerCount !== 1) {
                    return [false, "html-render-node " + node.id + " has amount of target containers =/= 1 "];
                }
            }
        }
        return [true, ""];

    }

    public compile(nodes: AbstractRenderNode[]): HtmlRenderCommand.Base[] {
        const commands: HtmlRenderCommand.Base[] = [];

        // data update
        for (let node of nodes) {
            if (node instanceof HtmlRenderNode) {
                commands.push(new HtmlRenderCommand.UpdateData(node));
            }
        }

        // render
        const containerIds = new Set<string>();
        for (let node of nodes) {
            if (node instanceof HtmlRenderNode) {
                containerIds.add(this.getContainerId(node));
            }
        }
        for (let containerId of containerIds) {
            commands.push(new HtmlRenderCommand.Draw(containerId, this.getNodes(nodes, containerId)));
        }

        return commands;
    }


    private getContainerId(node: HtmlRenderNode): string {
        for (const config of node.config.output) {
            if (config instanceof NodeOutput.HtmlContainer) {
                return config.id;
            }
        }
        throw new Error("no container configured");
    }

    private getNodes(nodes: AbstractRenderNode[], containerId: string): HtmlRenderNode[] {
        const filtered: HtmlRenderNode[] = [];
        for (let node of nodes) {
            if (node instanceof HtmlRenderNode && this.getContainerId(node) === containerId) {
                filtered.push(node);
            }
        }
        return filtered;
    }

}