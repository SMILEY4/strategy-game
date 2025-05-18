import {RenderGraphNodeCompiler} from "../renderGraphNodeCompiler";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphCompileContext} from "../renderGraphCompileContext";
import {VertexGeneratorRenderGraphNode} from "../nodes/vertexGeneratorRenderGraphNode";
import {RenderGraphCommand} from "../renderGraphCommand";
import {UpdateVertexDataRenderGraphCommand} from "../commands/updateVertexDataRenderGraphCommand";
import {PropertyRenderGraphNodeUtils} from "../nodes/propertyRenderGraphNode";
import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {RenderGraphKeys} from "../renderGraphKeys";

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
				this.buildExecCondition(node),
				PropertyRenderGraphNodeUtils.buildPropertyNameMapping(node.getPropertiesNamed(), []),
			),
		];
	}

	private buildExecCondition(node: VertexGeneratorRenderGraphNode): (resourceManager: RenderGraphResourceManager) => boolean {
		const properties = node.getProperties();
		return (resourceManager: RenderGraphResourceManager) => {
			const currentFrameId = resourceManager.getCurrentFrameId();
			return properties.some(property => {
				const lastUpdatedFrameId = resourceManager.getResourceLastUpdateFrameId(RenderGraphKeys.property(property));
				return currentFrameId === lastUpdatedFrameId;
			});
		};
	}

}