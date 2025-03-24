import {RenderGraphCompiler} from "../graph/renderGraphCompiler";
import {HtmlRenderCommand} from "./htmlRenderCommand";
import {AbstractRenderNode} from "../graph/nodes/abstractRenderNode";
import {ChangeProvider} from "../graph/changeProvider";
import {HtmlDrawNode} from "../graph/nodes/htmlDrawNode";
import {NodeOutput} from "../graph/nodes/nodeOutput";
import {NodeInput} from "../graph/nodes/nodeInput";
import {HtmlDataNode} from "../graph/nodes/htmlDataNode";

export class HtmlRenderGraphCompiler implements RenderGraphCompiler<HtmlRenderCommand.Base> {

	private readonly changeProvider: ChangeProvider;

	constructor(changeProvider: ChangeProvider) {
		this.changeProvider = changeProvider;
	}

	public validate(nodes: AbstractRenderNode[]): [boolean, string] {
		if (nodes.length === 0) {
			return [false, "graph is empty"];
		}
		for (let node of nodes) {
			if (node instanceof HtmlDrawNode) {
				const inputDataCount = node.config.input.count(it => it instanceof NodeInput.HtmlData);
				if (inputDataCount !== 1) {
					return [false, "html-draw-node " + node.id + " has amount of input data =/= 1"];
				}
				const outputContainerCount = node.config.output.count(it => it instanceof NodeOutput.HtmlContainer);
				if (outputContainerCount !== 1) {
					return [false, "html-draw-node " + node.id + " has amount of target containers =/= 1"];
				}
			}
			if (node instanceof HtmlDataNode) {
				const outputDataCount = node.config.output.count(it => it instanceof NodeOutput.HtmlData);
				if (outputDataCount === 0) {
					return [false, "html-data-node " + node.id + " has no output data"];
				}
			}
		}
		return [true, ""];

	}

	public compile(nodes: AbstractRenderNode[]): HtmlRenderCommand.Base[] {
		const commands: HtmlRenderCommand.Base[] = [];

		for (let node of nodes) {
			if (node instanceof HtmlDataNode) {
				commands.push(new HtmlRenderCommand.Update(node, this.changeProvider));
			}
		}

		const uniqueContainerIds = new Set<string>()
		for (const node of nodes) {
			if (node instanceof HtmlDrawNode) {
				uniqueContainerIds.add(this.getContainerId(node));
			}
		}

		for (let containerId of uniqueContainerIds) {
			const containerNodes = nodes
                .filter(it => it instanceof HtmlDrawNode)
                .filter(it => this.getContainerId(it) === containerId) as HtmlDrawNode<any, any>[]
            commands.push(new HtmlRenderCommand.Draw(containerId, containerNodes, this.changeProvider));
		}

		console.debug("html render graph compilation result:", commands.map(it => it.getDebugData()));

		return commands;
	}

	private getContainerId(node: AbstractRenderNode): string {
		if (node instanceof HtmlDrawNode) {
			return node.config.output.find(it => it instanceof NodeOutput.HtmlContainer)!.id;
		} else {
			throw new Error("Can not get container id from non html draw node.");
		}
	}

}