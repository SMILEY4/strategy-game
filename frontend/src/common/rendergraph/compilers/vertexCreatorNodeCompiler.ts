import {RenderGraphNodeCompiler} from "../renderGraphNodeCompiler";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphCompileContext} from "../renderGraphCompileContext";
import {VertexCreatorRenderGraphNode} from "../nodes/vertexCreatorRenderGraphNode";
import {RenderGraphCommand} from "../renderGraphCommand";
import {UpdateVertexDataRenderGraphCommand} from "../commands/updateVertexDataRenderGraphCommand";
import {PropertyRenderGraphNodeUtils} from "../nodes/propertyRenderGraphNode";

export class VertexCreatorNodeCompiler implements RenderGraphNodeCompiler<VertexCreatorRenderGraphNode> {

	isInlineCompile(): boolean {
		return true;
	}

	appliesTo(node: RenderGraphNode): boolean {
		return node instanceof VertexCreatorRenderGraphNode;
	}

	compile(node: VertexCreatorRenderGraphNode, context: RenderGraphCompileContext): RenderGraphCommand[] {
		return [
			new UpdateVertexDataRenderGraphCommand(
				node.getName(),
				node.getFunc(),
				node.getChangeTest(),
				PropertyRenderGraphNodeUtils.buildPropertyNameMapping(node.getPropertiesNamed()),
			),
		];
	}

}