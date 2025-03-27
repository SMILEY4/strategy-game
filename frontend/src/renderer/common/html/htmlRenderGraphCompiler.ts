import {RenderGraphCompiler} from "../graph/renderGraphCompiler";
import {HtmlRenderCommand} from "./htmlRenderCommand";
import {AbstractRenderNode} from "../graph/abstractRenderNode";
import {ChangeProvider} from "../graph/changeProvider";
import {HtmlOutputNode} from "../graph/htmlOutputNode";
import {NodeOutput} from "../graph/nodeOutput";
import {NodeInput} from "../graph/nodeInput";
import {HtmlNode} from "../graph/htmlNode";

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
			if (node instanceof HtmlOutputNode) {
				const inputDataCount = node.config.input.count(it => it instanceof NodeInput.HtmlData);
				if (inputDataCount == 0) {
					return [false, "html-output-node " + node.id + " has no input data"];
				}
				const outputContainerCount = node.config.output.count(it => it instanceof NodeOutput.HtmlContainer);
				if (outputContainerCount !== 1) {
					return [false, "html-output-node " + node.id + " has amount of target containers =/= 1"];
				}
			}
			if (node instanceof HtmlNode) {
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
			if (node instanceof HtmlNode) {
				commands.push(new HtmlRenderCommand.Update(node, this.changeProvider));
			}
		}

		for(let node of nodes) {
			if(node instanceof HtmlOutputNode) {

				const dataNames = node.config.input
					.filter(it => it instanceof NodeInput.HtmlData)
					.map(it => it.name)

				const inputNodes = nodes
					.filter(it => it instanceof HtmlNode)
					.map(it => it as HtmlNode<any>)
					.filter(it => it.config.output.some(out => dataNames.indexOf(out.name) != -1 ))

				const additionalChangeKeys = inputNodes
					.map(it => it.config.changeKey)
					.filter(it => it != null) as string[]

				const inputDataConfigs = inputNodes
					.flatMap(it => it.config.output)
					.filter(it => it instanceof NodeOutput.HtmlData)
					.map(it => it as NodeOutput.HtmlData<any>)
					.filter(it => dataNames.indexOf(it.name) != -1)

				commands.push(
					new HtmlRenderCommand.Output(
						node.config,
						inputDataConfigs,
						additionalChangeKeys,
						this.changeProvider
					)
				)
			}
		}

		console.debug("html render graph compilation result:", commands.map(it => it.getDebugData()));

		return commands;
	}

}