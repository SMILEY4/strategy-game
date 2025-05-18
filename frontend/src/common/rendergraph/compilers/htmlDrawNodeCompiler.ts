import {RenderGraphNodeCompiler} from "../renderGraphNodeCompiler";
import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphCompileContext} from "../renderGraphCompileContext";
import {RenderGraphCommand} from "../renderGraphCommand";
import {RenderHtmlElementsRenderGraphCommand} from "../commands/renderHtmlElementsRenderGraphCommand";
import {ContainerRenderGraphNode} from "../nodes/containerRenderGraphNode";
import {RenderGraphKeys} from "../renderGraphKeys";
import {RenderGraphResourceManager} from "../renderGraphResourceManager";

export class HtmlDrawNodeCompiler implements RenderGraphNodeCompiler<ContainerRenderGraphNode> {

	isInlineCompile(): boolean {
		return true;
	}

	appliesTo(node: RenderGraphNode): boolean {
		return node instanceof ContainerRenderGraphNode;
	}

	compile(node: ContainerRenderGraphNode, context: RenderGraphCompileContext): RenderGraphCommand[] {
		return [
			new RenderHtmlElementsRenderGraphCommand(
				RenderGraphKeys.cachedHtmlElement(node),
				RenderGraphKeys.property(node.getCameraProperty()),
				this.buildExecCondition(node),
				this.collectSources(node),
			),
		];
	}

	private buildExecCondition(node: ContainerRenderGraphNode): (resourceManager: RenderGraphResourceManager) => boolean {

		const properties = node
			.getDrawNodes()
			.map(it => it.getSource().generator)
			.flatMap(it => it.getProperties())
			.distinct()

		return (resourceManager: RenderGraphResourceManager) => {
			const currentFrameId = resourceManager.getCurrentFrameId();
			return properties.some(property => {
				const lastUpdatedFrameId = resourceManager.getResourceLastUpdateFrameId(RenderGraphKeys.property(property));
				return currentFrameId === lastUpdatedFrameId;
			});
		}
	}

	private collectSources(node: ContainerRenderGraphNode): RenderHtmlElementsRenderGraphCommand.Source[] {
		return node.getDrawNodes().map(it => {
			return {
				elementDataKey: RenderGraphKeys.genericData(it.getSource()),
				elementPoolKey: RenderGraphKeys.pooledHtmlElements(it.getSource()),
				cullingRadius: it.getCullingRadius(),
				lowQualityThreshold: it.getLowQualityThreshold(),
				templateFunc: it.getTemplateFunc(),
				renderFunc: it.getRenderFunc(),
			};
		});
	}

}