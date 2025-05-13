import {RenderGraphNodeCompiler} from "../renderGraphNodeCompiler";
import {RenderElementGeneratorRenderGraphNode} from "../nodes/renderElementGeneratorRenderGraphNode";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphCompileContext} from "../renderGraphCompileContext";
import {RenderGraphCommand} from "../renderGraphCommand";
import {PropertyRenderGraphNodeUtils} from "../nodes/propertyRenderGraphNode";
import {DataGeneratorRenderGraphNode} from "../nodes/dataGeneratorRenderGraphNode";
import {GeneratedDataUpdateRenderGraphCommand} from "../commands/generatedDataUpdateRenderGraphCommand";

export class DataGeneratorNodeCompiler implements RenderGraphNodeCompiler<DataGeneratorRenderGraphNode<any, any>> {

	constructor(private readonly appliesToCheck: (node: RenderGraphNode) => boolean,) {
	}

	appliesTo(node: RenderGraphNode): boolean {
		return this.appliesToCheck(node)
	}

	isInlineCompile(): boolean {
		return true;
	}

	compile(node: RenderElementGeneratorRenderGraphNode, context: RenderGraphCompileContext): RenderGraphCommand[] {
		return [
			new GeneratedDataUpdateRenderGraphCommand(
				node.getName(),
				node.getGeneratorFunction(),
				node.getChangeTest(),
				PropertyRenderGraphNodeUtils.buildPropertyNameMapping(node.getPropertiesNamed()),
			),
		];
	}

}
