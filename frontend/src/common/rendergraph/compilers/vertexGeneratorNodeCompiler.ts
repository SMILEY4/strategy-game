import {RenderGraphNodeCompiler} from "../renderGraphNodeCompiler";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphCompileContext} from "../renderGraphCompileContext";
import {VertexGeneratorRenderGraphNode} from "../nodes/vertexGeneratorRenderGraphNode";
import {RenderGraphCommand} from "../renderGraphCommand";
import {UpdateVertexDataRenderGraphCommand} from "../commands/updateVertexDataRenderGraphCommand";
import {PropertyRenderGraphNodeUtils} from "../nodes/propertyRenderGraphNode";

export class VertexGeneratorNodeCompiler implements RenderGraphNodeCompiler<VertexGeneratorRenderGraphNode> {

	isInlineCompile(): boolean {
		return true;
	}

	appliesTo(node: RenderGraphNode): boolean {
		return node instanceof VertexGeneratorRenderGraphNode;
	}

	compile(node: VertexGeneratorRenderGraphNode, context: RenderGraphCompileContext): RenderGraphCommand[] {
		return [
			new UpdateVertexDataRenderGraphCommand(
				node.getName(),
				node.getGeneratorFunction(),
				node.getChangeTest(),
				PropertyRenderGraphNodeUtils.buildPropertyNameMapping(node.getPropertiesNamed()),
			),
		];
	}

}