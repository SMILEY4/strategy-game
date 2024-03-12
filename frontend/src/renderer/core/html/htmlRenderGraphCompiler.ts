import {RenderGraphCompiler} from "../graph/renderGraphCompiler";
import {HtmlRenderCommand} from "./htmlRenderCommand";
import {AbstractRenderNode} from "../graph/abstractRenderNode";
import {HtmlRenderNode} from "../graph/htmlRenderNode";
import {NodeOutput} from "../graph/nodeOutput";
import HtmlData = NodeOutput.HtmlData;

export class HtmlRenderGraphCompiler implements RenderGraphCompiler<HtmlRenderCommand> {


    public validate(nodes: AbstractRenderNode[]): [boolean, string] {
        return [true, ""]; // todo
    }

    public compile(nodes: AbstractRenderNode[]): HtmlRenderCommand[] {
        const commands: HtmlRenderCommand[] = [];
        for (let node of nodes) {
            if (node instanceof HtmlRenderNode) {
                commands.push(this.compileNode(node));
            }
        }
        return commands;
    }

    private compileNode(node: HtmlRenderNode): HtmlRenderCommand {
        return new HtmlRenderCommand(this.getContainerId(node), this.getData(node), node);
    }

    private getContainerId(node: HtmlRenderNode): string {
        for (const config of node.config.output) {
            if (config instanceof NodeOutput.HtmlContainer) {
                return config.id;
            }
        }
        throw new Error("no container configured");
    }

    private getData(node: HtmlRenderNode): HtmlData[] {
        const data: HtmlData[] = [];
        for (const config of node.config.output) {
            if (config instanceof NodeOutput.HtmlData) {
                data.push(config);
            }
        }
        return data;
    }

}