import {RenderGraphNodeCompiler} from "../renderGraphNodeCompiler";
import {RenderElementGeneratorRenderGraphNode} from "../nodes/renderElementGeneratorRenderGraphNode";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphCompileContext} from "../renderGraphCompileContext";
import {RenderGraphCommand} from "../renderGraphCommand";
import {PropertyRenderGraphNodeUtils} from "../nodes/propertyRenderGraphNode";
import {DataGeneratorRenderGraphNode} from "../nodes/dataGeneratorRenderGraphNode";
import {GeneratedDataUpdateRenderGraphCommand} from "../commands/generatedDataUpdateRenderGraphCommand";
import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {RenderGraphKeys} from "../renderGraphKeys";

export class DataGeneratorNodeCompiler implements RenderGraphNodeCompiler<DataGeneratorRenderGraphNode<any, any>> {

	constructor(private readonly appliesToCheck: (node: RenderGraphNode) => boolean) {
	}

	appliesTo(node: RenderGraphNode): boolean {
		return this.appliesToCheck(node);
	}

	isInlineCompile(): boolean {
		return true;
	}

	compile(node: RenderElementGeneratorRenderGraphNode, context: RenderGraphCompileContext): RenderGraphCommand[] {
		return [
			new GeneratedDataUpdateRenderGraphCommand(
				node.getName(),
				node.getGeneratorFunction(),
				this.buildExecCondition(node),
				PropertyRenderGraphNodeUtils.buildPropertyNameMapping(node.getPropertiesNamed(), node.getOutputDefinitions()),
			),
		];
	}

	private buildExecCondition(node: RenderElementGeneratorRenderGraphNode): (resourceManager: RenderGraphResourceManager) => boolean {
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
